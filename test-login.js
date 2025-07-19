#!/usr/bin/env node

// Test script para verificar login con credenciales proporcionadas
const axios = require('axios');

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000';

async function testLogin() {
  try {
    console.log('🔍 Probando login con credenciales proporcionadas...');
    
    const credentials = {
      email: 'mmata@chubut.gov.ar',
      password: 'Lunitamia123'
    };

    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
    
    if (response.data.success) {
      console.log('✅ Login exitoso!');
      console.log('👤 Usuario:', response.data.data.user);
      console.log('🔑 Token generado:', response.data.data.token ? 'Sí' : 'No');
      
      // Test del dashboard
      const token = response.data.data.token;
      const userType = response.data.data.user.user_type;
      
      console.log('\n📊 Probando acceso al dashboard...');
      
      // Endpoint del dashboard según tipo de usuario
      const dashboardEndpoint = userType === 'provider' 
        ? '/api/dashboard/as' 
        : '/api/dashboard/explorer';
      
      const dashboardResponse = await axios.get(`${API_BASE_URL}${dashboardEndpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (dashboardResponse.data.success) {
        console.log('✅ Dashboard accesible');
        console.log('📈 Datos del dashboard:', dashboardResponse.data.data);
      } else {
        console.log('❌ Error en dashboard:', dashboardResponse.data.error);
      }
      
    } else {
      console.log('❌ Login fallido:', response.data.error);
    }
    
  } catch (error) {
    console.error('🚨 Error durante las pruebas:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else if (error.request) {
      console.error('No se pudo conectar al servidor:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Ejecutar prueba
testLogin();