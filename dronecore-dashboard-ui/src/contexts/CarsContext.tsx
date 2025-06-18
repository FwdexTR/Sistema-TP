import React, { createContext, useContext, useState, useEffect } from 'react';

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
  addCar: (car: Omit<Car, 'id' | 'createdAt'>) => void;
  updateCar: (id: string, car: Partial<Car>) => void;
  deleteCar: (id: string) => void;
  clearCars: () => void;
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

  useEffect(() => {
    const savedCars = localStorage.getItem('tpdrones_cars');
    if (savedCars) {
      setCars(JSON.parse(savedCars));
    }
  }, []);

  const saveCars = (carList: Car[]) => {
    setCars(carList);
    localStorage.setItem('tpdrones_cars', JSON.stringify(carList));
  };

  const addCar = (carData: Omit<Car, 'id' | 'createdAt'>) => {
    const newCar: Car = {
      id: `car_${Date.now()}`,
      ...carData,
      createdAt: new Date().toISOString().split('T')[0]
    };
    saveCars([...cars, newCar]);
  };

  const updateCar = (id: string, carData: Partial<Car>) => {
    const updatedCars = cars.map(car =>
      car.id === id ? { ...car, ...carData } : car
    );
    saveCars(updatedCars);
  };

  const deleteCar = (id: string) => {
    const updatedCars = cars.filter(car => car.id !== id);
    saveCars(updatedCars);
  };

  const clearCars = () => {
    saveCars([]);
  };

  const value = {
    cars,
    addCar,
    updateCar,
    deleteCar,
    clearCars
  };

  return (
    <CarsContext.Provider value={value}>
      {children}
    </CarsContext.Provider>
  );
};
