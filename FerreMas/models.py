# models.py
from django.db import models

class ImagenProducto(models.Model):
    codigo_imagen = models.CharField(max_length=100, unique=True)
    archivo = models.ImageField(upload_to='productos/')