import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCars, createCar, updateCar as apiUpdateCar } from '../services/api';

interface Car {
  id: string;
  model: string;
  plate: string;
  year: number;
  status: 'available' | 'in-use' | 'maintenance';
  createdAt: string;
}

interface CarsContextType {
  cars: Car[];
  addCar: (car: Omit<Car, 'id' | 'createdAt'>) => Promise<void>;
  updateCar: (id: string, car: Partial<Car>) => Promise<void>;
  deleteCar: (id: string) => void;
  clearCars: () => void;
  loading: boolean;
  error: string | null;
}

const CarsContext = createContext<CarsContextType | undefined>(undefined);

export const useCars = () => {
  const context = useContext(CarsContext);
  if (context === undefined) {
    throw new Error('useCars must be used within a CarsProvider');
  }
  return context;
};

export const CarsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      setLoading(true);
      setError(null);
      const carsData = await getCars();
      setCars(carsData);
    } catch (err) {
      setError('Erro ao carregar carros');
      console.error('Erro ao carregar carros:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCar = async (carData: Omit<Car, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      const newCar = await createCar(carData);
      setCars(prev => [...prev, newCar]);
    } catch (err) {
      setError('Erro ao adicionar carro');
      console.error('Erro ao adicionar carro:', err);
      throw err;
    }
  };

  const updateCar = async (id: string, carData: Partial<Car>) => {
    try {
      setError(null);
      const updatedCar = await apiUpdateCar(id, carData);
      setCars(prev => prev.map(car => car.id === id ? updatedCar : car));
    } catch (err) {
      setError('Erro ao atualizar carro');
      console.error('Erro ao atualizar carro:', err);
      throw err;
    }
  };

  const deleteCar = (id: string) => {
    setCars(prev => prev.filter(car => car.id !== id));
  };

  const clearCars = () => {
    setCars([]);
  };

  const value = {
    cars,
    addCar,
    updateCar,
    deleteCar,
    clearCars,
    loading,
    error
  };

  return (
    <CarsContext.Provider value={value}>
      {children}
    </CarsContext.Provider>
  );
};
