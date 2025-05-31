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



def crear_producto(request):
    return render(request, 'web/crear_producto.html')



def datos_personales(request):
    return render(request, 'web/datos_personales.html')

def armado_pedidos(request):
    return render(request, 'web/armado_pedidos.html')


def pedidos_realizados(request):
    return render(request, 'web/pedidos.html')

def trasferencias(request):
    return render(request, 'web/transferencias.html')

def historial_pedidos(request):
    return render(request, 'web/historial_pedidos.html')


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

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import mercadopago
import json

@csrf_exempt
def crear_preferencia(request):
    if request.method == 'POST':
        try:
            datos = json.loads(request.body)

            sdk = mercadopago.SDK("APP_USR-...")

            items = []
            for item in datos.get("items", []):
                items.append({
                    "title": item["nombre"],
                    "quantity": int(item["cantidad"]),
                    "unit_price": float(item["precio"]),
                    "currency_id": "CLP"
                })

            if datos.get("tipo_entrega") == "domicilio":
                items.append({
                    "title": "Despacho a domicilio",
                    "quantity": 1,
                    "unit_price": 5000.0,
                    "currency_id": "CLP"
                })

            preferencia_data = {
                "items": items,
                "back_urls": {
                    "success": "https://significance-suited-practice-nc.trycloudflare.com/carrito?status=success",
                    "failure": "https://significance-suited-practice-nc.trycloudflare.com/carrito?status=failure",
                    "pending": "https://significance-suited-practice-nc.trycloudflare.com/carrito?status=pending"
                },
                "auto_return": "approved"
            }

            preferencia = sdk.preference().create(preferencia_data)
            return JsonResponse({"init_point": preferencia["response"]["init_point"]})

        except Exception as e:
            print("❌ Error en crear_preferencia:", e)
            return JsonResponse({"error": "Error al crear preferencia"}, status=500)

    return JsonResponse({"error": "Método no permitido"}, status=405)

