import hashlib

def crack_sha1_hash(hash, use_salts = False):
    with open("./top-10000-passwords.txt", "r") as passwords_file:
        for password in passwords_file:
            password = password.strip()            

            if use_salts:
                with open("known-salts.txt") as salts_file:
                    for salt in salts_file:
                        salt = salt.strip()
                        hashed_password_with_salt_prefix = hashlib.sha1(f"{salt}{password}".encode("ascii")).hexdigest()
                        hashed_password_with_salt_sufix = hashlib.sha1(f"{password}{salt}".encode("ascii")).hexdigest()
                        
                        if hashed_password_with_salt_prefix == hash or hashed_password_with_salt_sufix == hash:
                            return password
            else:
                hashed_password = hashlib.sha1(password.encode("ascii")).hexdigest()

                if hashed_password == hash:
                    return password
                
    return "PASSWORD NOT IN DATABASE"