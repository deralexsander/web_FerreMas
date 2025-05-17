from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

# Vistas principales
def inicio(request):
    return render(request, 'web/inicio.html')

def acceso(request):
    return render(request, 'registration/acceso.html')

def productos(request):
    return render(request, 'web/productos.html')

def carrito(request):
    return render(request, 'web/carrito.html')

def perfil(request):
    return render(request, 'web/perfil.html')

def registro_personal(request):
    return render(request, 'registration/registro_personal.html')

def bodega(request):
    return render(request, 'web/bodega.html')

def crear_producto(request):
    return render(request, 'web/crear_producto.html')

def trabajadores(request):
    return render(request, 'web/trabajadores.html')

def datos_personales(request):
    return render(request, 'web/datos_personales.html')


# Vista para recibir la imagen desde el formulario y guardarla con el código UUID
@csrf_exempt
def subir_imagen(request):
    if request.method == 'POST':
        archivo = request.FILES.get('foto')
        codigo = request.POST.get('codigo_imagen')

        if not archivo or not codigo:
            return JsonResponse({'error': 'Faltan datos'}, status=400)

        nombre_archivo = f"productos/{codigo}.jpg"
        ruta = default_storage.save(nombre_archivo, ContentFile(archivo.read()))

        return JsonResponse({'status': 'ok', 'ruta': ruta})

    return JsonResponse({'error': 'Método no permitido'}, status=405)



# views.py

import mercadopago
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def crear_preferencia(request):
    if request.method == 'POST':
        datos = json.loads(request.body)

        sdk = mercadopago.SDK("APP_USR-3060994062731939-051521-21ad6cf9dbf496c7174f3213cbc90788-445521183")

        items = []
        for item in datos.get("items", []):
            items.append({
                "title": item["nombre"],
                "quantity": int(item["cantidad"]),
                "unit_price": float(item["precio"]),
                "currency_id": "CLP"
            })

        preferencia_data = {
            "items": items,
            "back_urls": {
                "success": "https://www.google.com",         # Redirección si el pago fue exitoso
                "failure": "https://www.youtube.com",        # Redirección si el pago fue rechazado
                "pending": "https://www.mercadopago.cl"      # Redirección si el pago está pendiente
                },
            "auto_return": "approved"
        }

        preferencia = sdk.preference().create(preferencia_data)
        return JsonResponse({"init_point": preferencia["response"]["init_point"]})
