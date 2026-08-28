import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map center updates
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function Map({ properties, center = [37.7749, -122.4194], zoom = 13 }) {
  const formatPrice = (price) => {
    if (price >= 1000000) {
        return `$${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 10000) {
        return `$${(price / 1000).toFixed(0)}k`;
    }
    return `$${price.toLocaleString()}`;
  };

  const createCustomIcon = (price) => {
      return L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: #006AFF; color: white; padding: 4px 8px; border-radius: 12px; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); white-space: nowrap;">${formatPrice(price)}</div>`,
          iconSize: [60, 30],
          iconAnchor: [30, 15]
      });
  };

  return (
    <div className="h-full w-full z-0">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />
        
        {properties.map(property => (
          <Marker 
            key={property.id} 
            position={property.coordinates}
            icon={createCustomIcon(property.price)}
          >
            <Popup className="custom-popup">
               <div className="w-48">
                  <img src={property.images[0]} className="w-full h-24 object-cover rounded mb-2" />
                  <div className="font-bold text-lg">${property.price.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">{property.beds}bd {property.baths}ba {property.sqft}sqft</div>
                  <div className="text-xs text-gray-500 truncate">{property.address}</div>
                  <Link to={`/property/${property.id}`} className="block mt-2 text-center bg-brand-500 text-white text-xs py-1 rounded hover:bg-brand-600">
                    View Details
                  </Link>
               </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}