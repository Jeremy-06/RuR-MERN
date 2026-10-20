import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const categories = [
    'Keyboards',
    'Mice',
    'Headsets',
    'Monitors',
    'Controllers',
    'Chairs',
    'Desks',
    'Mousepads',
    'Microphones',
    'Webcams',
    'Lighting',
    'Accessories'
]

export const errMsg = (message = '') => toast.error(message, {
    position: 'bottom-center'
});
export const successMsg = (message = '') => toast.success(message, {
    position: 'bottom-center'
});
