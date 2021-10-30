# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/bionic64"
  config.vm.network "forwarded_port", guest: 5432, host: 3000, host_ip: "127.0.0.1"
  config.vm.synced_folder ".", "/vagrant", disabled: true
  config.vm.define "PostgreSQL"
  

   config.vm.provider "virtualbox" do |vb|
     vb.gui = false
     vb.memory = 512
     vb.cpus = 1
   end

   config.vm.provision "shell", inline: <<-SHELL
     sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
     wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
     apt-get update 
     apt-get -y install postgresql-12
     useradd john
     echo -e -n "password\npassword" | passwd john
     sudo -u postgres psql -c "CREATE USER john WITH encrypted password 'password';"
     sudo -u postgres psql -c "CREATE DATABASE donationdb;"
     sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE donationdb TO john;"
     sudo sh -c 'echo "host    all             all             0.0.0.0/0            md5" >> /etc/postgresql/12/main/pg_hba.conf'
     sudo sh -c 'echo "host    all             all             ::0/0            md5" >> /etc/postgresql/12/main/pg_hba.conf'
     sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/12/main/postgresql.conf
     sudo service postgresql restart
     sudo ufw disable
   SHELL
end