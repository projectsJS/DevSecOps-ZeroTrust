# DevSecOps-ZeroTrust

## Local refresh

Run `.
efresh-local.ps1` from the repository root to rebuild the app image, load it into Minikube, and restart the Kubernetes deployment.

If you want to open the app in your browser locally, keep a port-forward running in a separate terminal:

```powershell
kubectl port-forward service/devsecops-service 8080:80
```