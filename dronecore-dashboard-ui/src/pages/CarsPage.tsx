import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Cars from './Cars';
import { getCars, createCar } from '../services/api';

const CarsPage: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    plate: '',
    model: '',
    year: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const localCars = localStorage.getItem('cars');
    if (localCars) {
      setCars(JSON.parse(localCars));
      setLoading(false);
      getCars()
        .then((data) => {
          setCars(data);
          localStorage.setItem('cars', JSON.stringify(data));
        })
        .catch(() => setError('Erro ao buscar carros do servidor.'));
    } else {
      getCars()
        .then((data) => {
          setCars(data);
          localStorage.setItem('cars', JSON.stringify(data));
        })
        .catch(() => setError('Erro ao buscar carros do servidor.'))
        .finally(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cars', JSON.stringify(cars));
  }, [cars]);

  const handleSaveCar = async () => {
    setLoading(true);
    setError(null);
    try {
      const newCar = await createCar({ ...formData });
      setCars((prev) => [...prev, newCar]);
      setIsModalOpen(false);
      setSelectedCar(null);
      setFormData({ name: '', plate: '', model: '', year: '' });
    } catch (err) {
      setError('Erro ao criar carro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-body">
      <Sidebar />
      <Cars />
    </div>
  );
};

export default CarsPage;
