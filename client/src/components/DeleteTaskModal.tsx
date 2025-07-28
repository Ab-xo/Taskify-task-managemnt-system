import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
}

export const DeleteTaskModal: React.FC<DeleteTaskModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  taskTitle
}) => {
  const [deleteText, setDeleteText] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (deleteText.toLowerCase() === 'delete') {
      onConfirm();
      setDeleteText('');
      onClose();
    }
  };

  const handleClose = () => {
    setDeleteText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 lg:p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-xl lg:text-2xl font-semibold text-black mb-4">Delete Task</h2>
        <p className="text-gray-600 mb-6 text-sm lg:text-base">
          This action can't be undone. Enter the word "delete" in the given field below to delete task
        </p>
        
        <Input
          value={deleteText}
          onChange={(e) => setDeleteText(e.target.value)}
          placeholder="Type delete in here"
          className="mb-6 border-gray-300 h-12 text-base"
        />
        
        <div className="flex gap-3 lg:gap-4 flex-col lg:flex-row">
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex-1 h-12 text-base order-2 lg:order-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={deleteText.toLowerCase() !== 'delete'}
            className="flex-1 h-12 bg-[#ec4c7d] hover:bg-[#d43e6b] text-white disabled:opacity-50 text-base order-1 lg:order-2"
          >
            Delete Task
          </Button>
        </div>
      </div>
    </div>
  );
};