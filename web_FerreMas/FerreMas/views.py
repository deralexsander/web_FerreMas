


from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import mercadopago
import json
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.shortcuts import redirect


def bloquear_clientes(view_func):
    def _wrapped_view(request, *args, **kwargs):
        es_trabajador = request.COOKIES.get("esTrabajador", "").lower()

        if es_trabajador != "true":
            return redirect('/perfil/')
        return view_func(request, *args, **kwargs)
    return _wrapped_view

# Vistas públicas
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

def datos_personales(request):
    return render(request, 'web/datos_personales.html')

def historial_pedidos(request):
    return render(request, 'web/historial_pedidos.html')

# Vistas protegidas
@bloquear_clientes
def registro_personal(request):
    return render(request, 'registration/registro_personal.html')

@bloquear_clientes
def crear_producto(request):
    return render(request, 'web/crear_producto.html')

@bloquear_clientes
def armado_pedidos(request):
    return render(request, 'web/armado_pedidos.html')

@bloquear_clientes
def pedidos_realizados(request):
    return render(request, 'web/pedidos.html')

@bloquear_clientes
def trasferencias(request):
    return render(request, 'web/transferencias.html')

# Carga de imagen
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

# Mercado Pago
@csrf_exempt
def crear_preferencia(request):
    if request.method == 'POST':
        try:
            datos = json.loads(request.body)
            sdk = mercadopago.SDK("TU_ACCESS_TOKEN_AQUI")
            items = [{
                "title": item["nombre"],
                "quantity": int(item["cantidad"]),
                "unit_price": float(item["precio"]),
                "currency_id": "CLP"
            } for item in datos.get("items", [])]

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
                    "success": "https://tusitio.com/carrito?status=success",
                    "failure": "https://tusitio.com/carrito?status=failure",
                    "pending": "https://tusitio.com/carrito?status=pending"
                },
                "auto_return": "approved"
            }

            preferencia = sdk.preference().create(preferencia_data)
            return JsonResponse({"init_point": preferencia["response"]["init_point"]})
        except Exception as e:
            print("❌ Error al crear preferencia:", e)
            return JsonResponse({"error": "Error al crear preferencia"}, status=500)

    return JsonResponse({"error": "Método no permitido"}, status=405)
