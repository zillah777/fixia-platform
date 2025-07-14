# 🔧 Comandos de Depuración para Fixia

## 📋 Información a Recopilar

### 1. **Console Errors**
```
F12 → Console Tab
Copiar cualquier error en rojo
```

### 2. **Network Requests**
```
F12 → Network Tab → Refresh página
Buscar requests en rojo (failed)
Click derecho → Copy → Copy as cURL
```

### 3. **Application State**
```
F12 → Application Tab → Local Storage
Verificar tokens JWT y datos de usuario
```

### 4. **Source Maps**
```
F12 → Sources Tab
Verificar si archivos JS se cargan correctamente
```

## 🚀 Scripts de Depuración Automática

### Frontend Debug Script
```javascript
// Pegar en Console del navegador
console.log('=== FIXIA DEBUG INFO ===');
console.log('URL:', window.location.href);
console.log('User Agent:', navigator.userAgent);
console.log('Local Storage:', localStorage);
console.log('Session Storage:', sessionStorage);
console.log('JWT Token:', localStorage.getItem('token'));
console.log('User Data:', localStorage.getItem('user'));
console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

// Test API connection
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(data => console.log('Backend Health:', data))
  .catch(err => console.error('Backend Error:', err));
```

### Backend Debug Commands
```bash
# En terminal del backend
cd /mnt/c/xampp/htdocs/fixia.com.ar/backend
npm run dev -- --verbose

# Ver logs en tiempo real
tail -f /var/log/fixia/backend.log

# Test endpoints
curl -X GET http://localhost:5000/health
curl -X GET http://localhost:5000/api/auth/me -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎯 Problemas Comunes a Revisar

### ❌ **Frontend Issues**
- [ ] Node.js versión (necesita 18+)
- [ ] Puerto 3000 disponible
- [ ] Variables de entorno NEXT_PUBLIC_*
- [ ] Errores de build/compilation

### ❌ **Backend Issues**
- [ ] PostgreSQL running (puerto 5432)
- [ ] Variables .env configuradas
- [ ] Puerto 5000 disponible
- [ ] Migración ejecutada exitosamente

### ❌ **Integration Issues**
- [ ] CORS configurado correctamente
- [ ] JWT tokens válidos
- [ ] API URLs matching
- [ ] Network connectivity

## 📱 Testing en Diferentes Navegadores
- Chrome (primario)
- Firefox 
- Safari (si Mac)
- Edge

## 🔄 Quick Restart Commands
```bash
# Backend restart
cd backend && npm run dev

# Frontend restart  
cd frontend && npm run dev

# Full system restart
cd backend && npm run dev &
cd ../frontend && npm run dev
```