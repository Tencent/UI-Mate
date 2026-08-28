
    import React, { useEffect } from 'react';
    import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
    import { Link } from 'react-router-dom';
    import L from 'leaflet';
    import { formatCurrency } from '../lib/utils';

    // Fix for default markers in Leaflet with Vite/Webpack
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    const UpdateMapCenter = ({ center }) => {
      const map = useMap();
      useEffect(() => {
        map.setView(center, map.getZoom());
      }, [center, map]);
      return null;
    };

    export const PropertyMap = ({ properties, center = [48.8566, 2.3522], zoom = 13 }) => {
      
      const createCustomIcon = (price) => {
        return L.divIcon({
          className: 'custom-marker',
          html: `<div class="bg-white text-gray-900 font-bold px-2 py-1 rounded-full shadow-md border border-gray-200 text-sm hover:scale-110 transition-transform hover:z-50 whitespace-nowrap">${formatCurrency(price)}</div>`,
          iconSize: [50, 30],
          iconAnchor: [25, 15]
        });
      };

      return (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className="h-full w-full z-0">
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <UpdateMapCenter center={center} />
          {properties.map(prop => {
            const lat = prop.coordinates?.lat;
            const lng = prop.coordinates?.lng;
            if (lat == null || lng == null) return null;
            const imgSrc = prop.thumbnailUrl || prop.photos?.[0]?.url || '';
            return (
              <Marker
                key={prop.id}
                position={[lat, lng]}
                icon={createCustomIcon(prop.pricePerNight)}
              >
                <Popup>
                  <div style={{ width: 220 }}>
                     {imgSrc && <img src={imgSrc} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: '4px 4px 0 0' }} alt={prop.name}/>}
                     <div style={{ padding: 8 }}>
                       <h3 style={{ fontWeight: 700, fontSize: 13, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prop.name}</h3>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                         <span style={{ fontWeight: 700 }}>{formatCurrency(prop.pricePerNight)} <span style={{ fontSize: 11, fontWeight: 400, color: '#666' }}>/ night</span></span>
                         <span style={{ fontSize: 12 }}>★ {prop.reviewScore}</span>
                       </div>
                       <Link to={`/property/${prop.id}`} style={{ display: 'block', marginTop: 8, textAlign: 'center', background: '#003580', color: 'white', fontSize: 12, padding: '4px 8px', borderRadius: 4, textDecoration: 'none' }}>View</Link>
                     </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      );
    };
  