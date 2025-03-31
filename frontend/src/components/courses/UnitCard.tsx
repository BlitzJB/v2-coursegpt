import React from 'react';
import { Unit } from '../../types/course';
import Card from '../ui/Card';

type UnitCardProps = {
  unit: Unit;
  onClick: (unitFolder: string) => void;
};

export const UnitCard: React.FC<UnitCardProps> = ({ unit, onClick }) => {
  return (
    <Card onClick={() => onClick(unit.folder)}>
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Unit {unit.unit_number}: {unit.unit_title}
        </h3>
        
        {unit.unit_description && (
          <p className="text-sm text-gray-600 dark:text-gray-300">{unit.unit_description}</p>
        )}
      </div>
    </Card>
  );
};

export default UnitCard; 