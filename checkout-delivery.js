// ==========================================================================
// ADORA — Dynamic Delivery & Instant Checkout Engine
// Localización: Lima Metropolitana, Perú
// ==========================================================================

const ADORA_WORKSHOP = {
  name: "Taller Central ADORA (San Borja / Surco)",
  lat: -12.0975,
  lng: -77.0065,
  phone: "51975369266" // Teléfono oficial de WhatsApp Business ADORA (Carlos Carbajal)
};

const LIMA_DISTRICTS = [
  { name: "San Borja", lat: -12.0864, lng: -77.0022 },
  { name: "Santiago de Surco", lat: -12.1340, lng: -76.9830 },
  { name: "Miraflores", lat: -12.1211, lng: -77.0298 },
  { name: "San Isidro", lat: -12.0975, lng: -77.0366 },
  { name: "La Molina", lat: -12.0792, lng: -76.9389 },
  { name: "Surquillo", lat: -12.1122, lng: -77.0175 },
  { name: "Barranco", lat: -12.1489, lng: -77.0208 },
  { name: "Jesús María", lat: -12.0744, lng: -77.0489 },
  { name: "Lince", lat: -12.0833, lng: -77.0361 },
  { name: "Magdalena del Mar", lat: -12.0917, lng: -77.0708 },
  { name: "Pueblo Libre", lat: -12.0717, lng: -77.0658 },
  { name: "San Miguel", lat: -12.0772, lng: -77.0867 },
  { name: "Chorrillos", lat: -12.1800, lng: -77.0150 },
  { name: "Breña", lat: -12.0583, lng: -77.0500 },
  { name: "Cercado de Lima", lat: -12.0464, lng: -77.0428 },
  { name: "Salamanca / Ate", lat: -12.0711, lng: -76.9822 },
  { name: "Los Olivos", lat: -11.9933, lng: -77.0706 },
  { name: "San Juan de Lurigancho", lat: -11.9833, lng: -76.9833 }
];

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function computeDeliveryFee(targetLat, targetLng) {
  const distanceKm = calculateHaversineDistance(ADORA_WORKSHOP.lat, ADORA_WORKSHOP.lng, targetLat, targetLng);
  const BASE_FEE = 8.00; // Tarifa base de arranque en Lima
  const KM_RATE = 1.80;  // Por km adicional
  
  let fee = BASE_FEE + (distanceKm * KM_RATE);
  let roundedFee = Math.ceil(fee);
  if (roundedFee < 10) roundedFee = 10; // Tarifa mínima S/. 10
  
  return {
    distanceKm: distanceKm.toFixed(1),
    fee: roundedFee,
    estimatedMinutes: Math.round(distanceKm * 3.5 + 25)
  };
}

// Render dynamic delivery UI in product modal
function injectDeliverySection(container, product) {
  if (!container) return;

  container.innerHTML = `
    <div class="delivery-calculator-card" style="margin-top: 1rem; padding: 1rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <span style="font-size: 0.85rem; font-weight: 600; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 0.05em;">
          🚚 Cotizar Envío Inmediato
        </span>
        <button type="button" id="btn-use-gps" style="background: none; border: 1px solid var(--accent-gold); color: var(--accent-gold); border-radius: 6px; padding: 0.2rem 0.5rem; font-size: 0.75rem; cursor: pointer;">
          📍 Usar mi GPS
        </button>
      </div>

      <div style="margin-bottom: 0.6rem;">
        <label style="display: block; font-size: 0.75rem; color: var(--text-dim); margin-bottom: 0.25rem;">Distrito de Destino en Lima:</label>
        <select id="checkout-district-select" style="width: 100%; padding: 0.5rem; background: #16181e; border: 1px solid #333842; color: #fff; border-radius: 8px; font-size: 0.85rem;">
          ${LIMA_DISTRICTS.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
        </select>
      </div>

      <div style="margin-bottom: 0.6rem;">
        <label style="display: block; font-size: 0.75rem; color: var(--text-dim); margin-bottom: 0.25rem;">Dirección exacta o referencia:</label>
        <input type="text" id="checkout-address-input" placeholder="Ej. Av. Primavera 1240, Dpto 502" style="width: 100%; padding: 0.5rem; background: #16181e; border: 1px solid #333842; color: #fff; border-radius: 8px; font-size: 0.85rem;" />
      </div>

      <div style="margin-bottom: 0.6rem;">
        <label style="display: block; font-size: 0.75rem; color: var(--text-dim); margin-bottom: 0.25rem;">Mensaje para la tarjeta (Opcional):</label>
        <input type="text" id="checkout-card-input" placeholder="Ej. Para la mejor persona del mundo..." style="width: 100%; padding: 0.5rem; background: #16181e; border: 1px solid #333842; color: #fff; border-radius: 8px; font-size: 0.85rem;" />
      </div>

      <div id="delivery-quote-result" style="background: rgba(212, 175, 55, 0.08); border-left: 3px solid var(--accent-gold); padding: 0.6rem; border-radius: 4px; margin-bottom: 0.8rem; font-size: 0.82rem;">
        <!-- Injected dynamically -->
      </div>

      <button type="button" id="btn-submit-order-wa" style="width: 100%; padding: 0.85rem; background: linear-gradient(135deg, #25D366, #128C7E); color: #fff; border: none; border-radius: 10px; font-weight: 700; font-size: 0.95rem; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 0.5rem; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.25);">
        <span>📲</span>
        <span>Pedir por WhatsApp con Envío Incluido</span>
      </button>
    </div>
  `;

  // Attach handlers
  const districtSelect = document.getElementById('checkout-district-select');
  const gpsBtn = document.getElementById('btn-use-gps');
  const resultDiv = document.getElementById('delivery-quote-result');
  const submitBtn = document.getElementById('btn-submit-order-wa');
  const addressInput = document.getElementById('checkout-address-input');
  const cardInput = document.getElementById('checkout-card-input');

  let currentQuote = {
    district: LIMA_DISTRICTS[0].name,
    distanceKm: "2.5",
    fee: 12,
    estimatedMinutes: 30
  };

  function updateQuote(lat, lng, districtName) {
    const res = computeDeliveryFee(lat, lng);
    currentQuote = {
      district: districtName,
      distanceKm: res.distanceKm,
      fee: res.fee,
      estimatedMinutes: res.estimatedMinutes
    };

    const pvpNum = parseFloat(product.pvp) || 0;
    const totalOrder = pvpNum + res.fee;

    resultDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.2rem;">
        <span>Distancia estimada:</span>
        <strong>${res.distanceKm} km</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.2rem;">
        <span>Costo de Delivery:</span>
        <strong>S/ ${res.fee}.00</strong>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.95rem; font-weight: 700; color: var(--accent-gold); border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.3rem; margin-top: 0.3rem;">
        <span>TOTAL DEL PEDIDO:</span>
        <span>S/ ${totalOrder.toFixed(2)}</span>
      </div>
    `;
  }

  // Initial calculation with first district
  updateQuote(LIMA_DISTRICTS[0].lat, LIMA_DISTRICTS[0].lng, LIMA_DISTRICTS[0].name);

  districtSelect.addEventListener('change', (e) => {
    const found = LIMA_DISTRICTS.find(d => d.name === e.target.value);
    if (found) {
      updateQuote(found.lat, found.lng, found.name);
    }
  });

  gpsBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada en tu navegador.');
      return;
    }
    gpsBtn.textContent = '⏳ Ubicando...';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        gpsBtn.textContent = '📍 GPS Activo';
        updateQuote(pos.coords.latitude, pos.coords.longitude, "Ubicación GPS");
      },
      (err) => {
        gpsBtn.textContent = '📍 Usar mi GPS';
        alert('No pudimos acceder a tu ubicación. Por favor selecciona tu distrito.');
      }
    );
  });

  submitBtn.addEventListener('click', () => {
    const address = addressInput.value.trim() || 'Coordinar por WhatsApp';
    const cardMsg = cardInput.value.trim() || 'Sin tarjeta dedicatoria';
    const pvpNum = parseFloat(product.pvp) || 0;
    const grandTotal = pvpNum + currentQuote.fee;

    const waText = `✨ *NUEVO PEDIDO ADORA* ✨%0A%0A` +
      `🌸 *Ramo:* ${encodeURIComponent(product.name)} (${product.sku})%0A` +
      `💰 *Precio Ramo:* S/ ${product.pvp}%0A` +
      `📍 *Destino:* ${encodeURIComponent(address)} (${encodeURIComponent(currentQuote.district)})%0A` +
      `🚚 *Distancia:* ${currentQuote.distanceKm} km | *Envío:* S/ ${currentQuote.fee}.00%0A` +
      `💵 *TOTAL A PAGAR:* S/ ${grandTotal.toFixed(2)}%0A%0A` +
      `💌 *Dedicatoria:* "${encodeURIComponent(cardMsg)}"%0A%0A` +
      `Hola Carlos, deseo confirmar este pedido. ¿Me brindas el número de Yape/Plin o BCP?`;

    const waUrl = `https://wa.me/${ADORA_WORKSHOP.phone}?text=${waText}`;
    window.open(waUrl, '_blank');
  });
}

window.injectDeliverySection = injectDeliverySection;
