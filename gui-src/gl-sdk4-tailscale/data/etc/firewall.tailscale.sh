#!/bin/sh
TS_ZONE=tailscale0
TS_LAN=tailscale_lan
LAN_TS=lan_tailscale
TS_WAN=tailscale_wan
WAN_TS=wan_tailscale
TS_IFNAME=tailscale0

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
    lan_enabled=$(uci -q get tailscale.settings.lan_enabled)
    wan_enabled=$(uci -q get tailscale.settings.wan_enabled)
    run_exit_node="$(uci -q get tailscale.settings.advertise_exit_node)"
    enable_masq="$(uci -q get tailscale.settings.lan_gateway)"

    # Ensure tailscale0 is not attached to WAN zone devices list
    idx="$(uci -q show firewall | sed -n "s/^firewall\.@zone\[\([0-9]\+\)\]\.name='\?wan'\?$/\1/p" | head -n1)"
    [ -n "$idx" ] && uci -q del_list firewall.@zone[$idx].device='tailscale0'

    if [ "$enabled" = "1" ]; then
        ret=$(add_zone) && [ "$ret" = "1" ] && let need_reload+=1
    else
        ret=$(del_rule $TS_ZONE) && [ "$ret" = "1" ] && let need_reload+=1
    fi

    if [ "$enabled" = "1" -a "$lan_enabled" = "1" ]; then
        ret=$(accept_ts_to_lan) && [ "$ret" = "1" ] && let need_reload+=1
    else
        ret=$(del_rule $TS_LAN) && [ "$ret" = "1" ] && let need_reload+=1
    fi

    if [ "$enabled" = "1" -a "$wan_enabled" = "1" ]; then
        ret=$(accept_wan_to_ts) && [ "$ret" = "1" ] && let need_reload+=1
    else
        ret=$(del_rule $WAN_TS) && [ "$ret" = "1" ] && let need_reload+=1
    fi

    if [ "$enabled" = "1" ] && ([ "$wan_enabled" = "1" ] || [ "$run_exit_node" = "1" ]); then
        ret=$(accept_ts_to_wan) && [ "$ret" = "1" ] && let need_reload+=1
    else
        ret=$(del_rule $TS_WAN) && [ "$ret" = "1" ] && let need_reload+=1
    fi

    if [ "$enabled" = "1" ] && ([ "$lan_enabled" = "1" ] || [ "$enable_masq" = "1" ]); then
        ret=$(accept_lan_to_ts) && [ "$ret" = "1" ] && let need_reload+=1
    else
        ret=$(del_rule $LAN_TS) && [ "$ret" = "1" ] && let need_reload+=1
    fi

    uci commit firewall
    [ $need_reload != 0 ] && /etc/init.d/firewall reload
}

restart
