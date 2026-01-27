import { useMapEvents } from 'react-leaflet';

export default function MapDrawHandler({ onDraw }) {
    useMapEvents({
        click(e) {
            onDraw(e.latlng);
        },
    });
    return null;
}
