#!/bin/sh
TS_ZONE=tailscale0
TS_LAN=tailscale_lan
LAN_TS=lan_tailscale
TS_WAN=tailscale_wan
WAN_TS=wan_tailscale
TS_IFNAME=tailscale0

# GL firmware >= 4.9 owns the tailscale0 IP Masquerading toggle natively; on
# those builds we must NOT set or delete it (would trample GL's state). Only
# manage tailscale0 masq on pre-4.9. /etc/glversion holds e.g. "4.3.26".
is_fw49_plus() {
    local v major minor
    v=$(awk '{print $1}' /etc/glversion 2>/dev/null)
    [ -z "$v" ] && return 1
    major=${v%%.*}; minor=${v#*.}; minor=${minor%%.*}
    [ "$major" -gt 4 ] 2>/dev/null && return 0
    { [ "$major" -eq 4 ] && [ "$minor" -ge 9 ]; } 2>/dev/null && return 0
    return 1
}

add_zone()
{
    rule_exist=$(uci -q get firewall.$TS_ZONE)
    [ -n "$rule_exist" ] && return 0

    uci set firewall.$TS_ZONE=zone
    uci set firewall.$TS_ZONE.name=tailscale0
    uci set firewall.$TS_ZONE.input=ACCEPT
    uci set firewall.$TS_ZONE.mtu_fix='1'
    uci add_list firewall.$TS_ZONE.device=$TS_IFNAME

    echo 1
}

# Masquerade traffic leaving via tailscale0 so hosts behind this router's LAN
# (the LuCI/UCI firewall zones forwarded to tailscale0) can reach the tailnet
# WITHOUT running Tailscale themselves and without every peer having to accept an
# advertised LAN route: their packets are SNAT'd to this node's Tailscale IP, so
# any peer replies straight back to the router, which un-NATs to the LAN host.
# Idempotent and set even when the zone already exists (add_zone early-returns
# on an existing zone, so create-time-only masq would never take effect).
# Returns 1 when it changed something (so restart() knows to reload).
ensure_ts_masq()
{
    changed=0
    if [ "$(uci -q get firewall.$TS_ZONE.masq)" != "1" ]; then
        uci set firewall.$TS_ZONE.masq='1'
        changed=1
    fi
    if [ "$(uci -q get firewall.$TS_ZONE.masq6)" != "1" ]; then
        uci set firewall.$TS_ZONE.masq6='1'
        changed=1
    fi
    [ "$changed" = "1" ] && echo 1
}

# Remove the outbound masquerade (used when Tailscale is disabled).
del_ts_masq()
{
    changed=0
    [ -n "$(uci -q get firewall.$TS_ZONE.masq)" ]  && uci -q delete firewall.$TS_ZONE.masq  && changed=1
    [ -n "$(uci -q get firewall.$TS_ZONE.masq6)" ] && uci -q delete firewall.$TS_ZONE.masq6 && changed=1
    [ "$changed" = "1" ] && echo 1
}

accept_wan_to_ts()
{
    rule_exist=$(uci -q get firewall.$WAN_TS)
    [ -n "$rule_exist" ] && return 0

    uci set firewall.$WAN_TS=forwarding
    uci set firewall.$WAN_TS.src=wan
    uci set firewall.$WAN_TS.dest=$TS_IFNAME

    echo 1
}

accept_ts_to_wan()
{
    rule_exist=$(uci -q get firewall.$TS_WAN)
    [ -n "$rule_exist" ] && return 0

    uci set firewall.$TS_WAN=forwarding
    uci set firewall.$TS_WAN.src=$TS_IFNAME
    uci set firewall.$TS_WAN.dest=wan

    echo 1
}

accept_lan_to_ts()
{
    rule_exist=$(uci -q get firewall.$LAN_TS)
    [ -n "$rule_exist" ] && return 0

    uci set firewall.$LAN_TS=forwarding
    uci set firewall.$LAN_TS.src=lan
    uci set firewall.$LAN_TS.dest=$TS_IFNAME

    echo 1
}

accept_ts_to_lan()
{
    rule_exist=$(uci -q get firewall.$TS_LAN)
    [ -n "$rule_exist" ] && return 0

    uci set firewall.$TS_LAN=forwarding
    uci set firewall.$TS_LAN.src=$TS_IFNAME
    uci set firewall.$TS_LAN.dest=lan

    echo 1
}

del_rule()
{
    rule_exist=$(uci -q get firewall.$1)
    [ -n "$rule_exist" ] && uci delete firewall.$1 && echo 1
}

restart()
{
    need_reload=0

    enabled=$(uci -q get tailscale.settings.enabled)
    exit_node_ip=$(uci -q get tailscale.settings.exit_node_ip)
    lan_enabled=$(uci -q get tailscale.settings.lan_enabled)
    wan_enabled=$(uci -q get tailscale.settings.wan_enabled)
    lan_gateway=$(uci -q get tailscale.settings.lan_gateway)
    advertise_exit_node=$(uci -q get tailscale.settings.advertise_exit_node)

    if [ "$enabled" = "1" ]; then
        ret=$(add_zone) && [ "$ret" = "1" ] && let need_reload+=1
    else
        ret=$(del_rule $TS_ZONE) && [ "$ret" = "1" ] && let need_reload+=1
    fi

    # LAN gateway (panel toggle "lan_gateway"): outbound SNAT so hosts behind the
    # LAN reach the tailnet without running Tailscale. Independent of lan_enabled
    # (which is the inbound advertise-routes direction).
    # On GL 4.9+, GL owns the tailscale0 masquerade toggle natively -> don't touch
    # it. On pre-4.9 the plugin manages it (gated on the lan_gateway panel toggle).
    if ! is_fw49_plus; then
        if [ "$enabled" = "1" ] && [ "$lan_gateway" = "1" ]; then
            ret=$(ensure_ts_masq) && [ "$ret" = "1" ] && let need_reload+=1
        else
            ret=$(del_ts_masq) && [ "$ret" = "1" ] && let need_reload+=1
        fi
    fi

    if [ "$enabled" = "1" ] && ([ "$lan_enabled" = "1" ] || [ -n "$exit_node_ip" ] || [ "$lan_gateway" = "1" ]); then
        ret=$(accept_lan_to_ts) && [ "$ret" = "1" ] && let need_reload+=1
        ret=$(accept_ts_to_lan) && [ "$ret" = "1" ] && let need_reload+=1
    else
        ret=$(del_rule $TS_LAN) && [ "$ret" = "1" ] && let need_reload+=1
        ret=$(del_rule $LAN_TS) && [ "$ret" = "1" ] && let need_reload+=1
    fi

    # ts->wan forwarding is needed for WAN sharing, for using an exit node, AND for
    # advertising THIS node as an exit node (tailnet clients egress via wan).
    if [ "$enabled" = "1" ] && ([ "$wan_enabled" = "1" ] || [ -n "$exit_node_ip" ] || [ "$advertise_exit_node" = "1" ]); then
        ret=$(accept_wan_to_ts) && [ "$ret" = "1" ] && let need_reload+=1
        ret=$(accept_ts_to_wan) && [ "$ret" = "1" ] && let need_reload+=1
    else
        ret=$(del_rule $TS_WAN) && [ "$ret" = "1" ] && let need_reload+=1
        ret=$(del_rule $WAN_TS) && [ "$ret" = "1" ] && let need_reload+=1
    fi

    uci commit firewall
    [ $need_reload != 0 ] && /etc/init.d/firewall reload
}

restart
