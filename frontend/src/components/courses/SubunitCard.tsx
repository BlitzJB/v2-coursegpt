import React from 'react';
import { Subunit } from '../../types/course';
import Card from '../ui/Card';

type SubunitCardProps = {
  subunit: Subunit;
  onClick: (subunitFile: string) => void;
};

const SubunitCard: React.FC<SubunitCardProps> = ({ subunit, onClick }) => {
  const handleClick = () => {
    onClick(subunit.file);
  };

  return (
    <Card onClick={handleClick}>
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          {subunit.subunit_number}: {subunit.subunit_title}
        </h3>
        {subunit.learning_objectives && subunit.learning_objectives.length > 0 && (
          <div className="mt-2">
            <span className="text-sm font-medium dark:text-gray-300">Learning objectives:</span>
            <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside ml-2">
              {subunit.learning_objectives.slice(0, 2).map((objective, i) => (
                <li key={i}>{objective}</li>
              ))}
              {subunit.learning_objectives.length > 2 && (
                <li className="text-gray-500 dark:text-gray-500">...and {subunit.learning_objectives.length - 2} more</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SubunitCard; 