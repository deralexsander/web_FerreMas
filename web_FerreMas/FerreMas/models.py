# models.py
from django.db import models

class Producto(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    precio = models.IntegerField()
    imagen = models.ImageField(upload_to='productos/')  # ¡Aquí se guarda la imagen!
    creado_en = models.DateTimeField(auto_now_add=True)
