# VibeCheck VM Deployment

This folder targets a single Ubuntu VM running k3s with the default Traefik ingress controller.

## VM assumptions

- k3s is already installed and healthy.
- Helm 3 is installed.
- Ports `22`, `80`, and `443` are open in the VM firewall.
- The deploy commands are run on the VM, normally as `root`, from the repository checkout.

The current default public IP is `66.151.43.218`, so ingress hosts are rendered as:

- `http://gateway.66.151.43.218.sslip.io`
- `http://user.66.151.43.218.sslip.io`
- `http://review.66.151.43.218.sslip.io`
- `http://review-admin.66.151.43.218.sslip.io`
- `http://gamification.66.151.43.218.sslip.io`
- `http://ui.66.151.43.218.sslip.io`
- `http://kafka-ui.66.151.43.218.sslip.io`
- `http://minio.api.66.151.43.218.sslip.io`
- `http://minio.console.66.151.43.218.sslip.io`

## Configure

Copy and adjust the deploy env if needed:

```sh
cp infra_vm/deploy/env.example infra_vm/deploy/.env
```

Important values:

- `VM_PUBLIC_IP`: VM external IP.
- `BASE_DOMAIN`: defaults to `${VM_PUBLIC_IP}.sslip.io`.
- `INGRESS_CLASS_NAME`: defaults to `traefik` for k3s.
- `KUBECONFIG`: defaults to `/etc/rancher/k3s/k3s.yaml`.
- `USER_SERVICE_SMTP_PASSWORD`: required by `user-service`.

## Deploy

Light stack without Grafana/Kibana/Elasticsearch:

```sh
bash infra_vm/deploy/script_light.sh
```

Full stack with observability:

```sh
bash infra_vm/deploy/script.sh
```

## Push images

Run push scripts from any directory. They resolve Docker build contexts from the repository root.

```sh
sh infra_vm/docker_scripts/push_user.sh 18.2
sh infra_vm/docker_scripts/push_gateway.sh 16.1
sh infra_vm/docker_scripts/push_ui.sh 1.1
```

Set `PLATFORMS=linux/amd64` when you only need images for this VM.
