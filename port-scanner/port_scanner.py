import socket
import re

from common_ports import ports_and_services

def get_open_ports(target, port_range, verbose = False):
    open_ports = []

    for port in range(port_range[0], port_range[1] + 1):
        server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server_socket.settimeout(1)

        try:
            connection_result = server_socket.connect_ex((target, port))

            if connection_result != 0:
                continue

            open_ports.append(port)
        except socket.gaierror:
            server_socket.close()

            if is_ip_address(target):
                return "Error: Invalid IP address"

            return "Error: Invalid hostname"

        server_socket.close()
    
    if not verbose:
        return open_ports

    return get_verbose_result(target, open_ports)


def get_verbose_result(target, open_ports):
    if not is_ip_address(target):
        ip_address = socket.gethostbyname(target)

        target = f"{target} ({ip_address})"
    else:
        try:
            host = socket.gethostbyaddr(target)[0]

            target = f"{host} ({target})"
        except socket.error:
            pass

    result = f"Open ports for {target}\nPORT     SERVICE\n"

    for port in open_ports:
        number_of_spaces_between = 9 - len(str(port))
        spaces_between = " " * number_of_spaces_between
        service = ports_and_services[port]

        result += f"{port}{spaces_between}{service}\n"

    return result[:-1]

def is_ip_address(target):
    return re.search("^\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}$", target)