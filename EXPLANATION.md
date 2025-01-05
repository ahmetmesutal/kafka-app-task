
# 1. Scalability (Ölçeklenebilirlik)
Horizontal Pod Autoscaler (HPA) kullandım.
HPA ile pod sayısı otomatik olarak artırılıyor.
CPU ve bellek kullanımına göre ölçekleme sağladım.

# 2. Fault Tolerance (Hata Toleransı)
Pod restart durumları için Liveness ve Readiness Probes ekledim. Mongo ve Kafka tek node dan oluşuyor. Konteyner ortamında barındırılmasını uygun görmediğim için tek node yaptım. Normalde sanal makine içerisinde cluster yapısında olmalı.

# 3. Security (Güvenlik)

Uygulamalarr için gerekli Network Policies ler oluşturuldu. Servis tipi olarak ClusterIP tercih edildi. NodePort tercih edilen servisler senaryo amaçlı dışarıya açılmıştır.

Karşılaşılan sorunlarda dökümanlar, eski çalışmalar ve yapay zekadan yararlanıldı.

