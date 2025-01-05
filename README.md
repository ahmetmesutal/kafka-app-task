* Task 1-2-3 içerisinde bahsedilen uygulamalar producer-app, consumer-app ve api-app klasörü içerisindedir. Klasörler içerisinde uygulama kodları, .env ve Dockerfile vardır.

* k8s klasörü içerisinde kubernetes manifest dosyaları vardır.

* helm ile ilgili dosyalar helm-release klasörü altındadır.

* Tüm bonuslar yapılmıştır.

* 1.Bonus, Prometheus ve prometheus exporterlar manifest dosyaları içerisindedir.

* 2.Bonus, DLQ consumer-app içerisindeki kodlarda mevcuttur.

* 3.Bonus, docker-compose klasörü içerisinde test ortamı dosyaları vardır. Uygulamaların kod ve .env kısımları docker compose a göre ayarlanmıştır. "docker compose up -d" komutuyla uygulamayı ayağa kaldırabilirsiniz.

* 4.Bonus, create-k8s-cluster-terraform klasörü altındadır. provider olarak aws seçilmiştir. instance key i önceden oluşturmanız gerekir. main.tf içerisindeki locals verilerini kendinize göre değiştirip çalıştırabilirsiniz.

* kafka-app-task release'i repository içerisindedir. aşağıdaki komutlarla repo yu çekip uygulamayı çalıştırabilirsiniz.

```
helm repo add kafka-app-task 'https://raw.githubusercontent.com/ahmetmesutal/kafka-app-task/main'
```

```
helm install kafka-app-task kafka-app-task/kafka-app-task  
```
