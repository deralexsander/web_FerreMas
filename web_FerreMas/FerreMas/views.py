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
