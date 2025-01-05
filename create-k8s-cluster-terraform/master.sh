#! /bin/bash
apt-get update -y
apt-get upgrade -y
hostnamectl set-hostname kube-master
apt-get install -y apt-transport-https ca-certificates curl gpg
mkdir -p -m 755 /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.30/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.30/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
apt-get update
apt-get install -y kubelet kubeadm kubectl
apt-get install -y kubernetes-cni docker.io
apt-mark hold kubelet kubeadm kubectl
systemctl start docker
systemctl enable docker
usermod -aG docker ubuntu
newgrp docker
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF
sysctl --system
mkdir /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml >/dev/null 2>&1
sed -i 's/SystemdCgroup = false/SystemdCgroup = true/g' /etc/containerd/config.toml
systemctl restart containerd
systemctl enable containerd
kubeadm config images pull
kubeadm init --pod-network-cidr=10.244.0.0/16 --ignore-preflight-errors=All
mkdir -p /home/ubuntu/.kube
cp -i /etc/kubernetes/admin.conf /home/ubuntu/.kube/config
chown ubuntu:ubuntu /home/ubuntu/.kube/config
su - ubuntu -c 'kubectl apply -f https://github.com/coreos/flannel/raw/master/Documentation/kube-flannel.yml'