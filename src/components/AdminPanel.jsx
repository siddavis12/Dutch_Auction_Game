import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Panel = styled(motion.div)`
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  padding: 30px;
  border-radius: 20px;
  border: 2px solid #f39c12;
  min-width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h2`
  color: #f39c12;
  margin: 0 0 20px 0;
  font-size: 24px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  &::before {
    content: '⚙️';
    font-size: 28px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  color: #f39c12;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  
  &:hover {
    color: #e67e22;
  }
`;

const Section = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border-left: 4px solid #f39c12;
`;

const SectionTitle = styled.h3`
  color: #f39c12;
  margin: 0 0 15px 0;
  font-size: 18px;
`;

const CreateForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 16px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 10px rgba(243, 156, 18, 0.5);
  }
`;

const Button = styled(motion.button)`
  padding: 15px;
  border: none;
  border-radius: 8px;
  background: ${props => props.variant === 'danger' ? '#e74c3c' : '#f39c12'};
  color: white;
  font-weight: bold;
  cursor: pointer;
  font-size: 16px;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ChatControl = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-top: 10px;
`;

const ChatStatus = styled.div`
  color: ${props => props.$enabled ? '#27ae60' : '#e74c3c'};
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &::before {
    content: ${props => props.$enabled ? "'💬'" : "'🔇'"};
    font-size: 20px;
  }
`;

const AdminBadge = styled.div`
  background: linear-gradient(45deg, #f39c12, #e67e22);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
  text-align: center;
  margin-bottom: 20px;
  
  &::before {
    content: '👑 ';
  }
`;

function AdminPanel({ isOpen, onClose, onCreateAuction, onToggleChat, chatEnabled }) {
  const [formData, setFormData] = useState({
    item: '',
    startPrice: '',
    minPrice: '',
    decrementAmount: '10',
    decrementInterval: '1.0'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.item && formData.startPrice && formData.minPrice) {
      onCreateAuction({
        item: formData.item,
        startPrice: parseInt(formData.startPrice),
        minPrice: parseInt(formData.minPrice),
        decrementAmount: parseInt(formData.decrementAmount),
        decrementInterval: Math.round(parseFloat(formData.decrementInterval) * 1000)
      });
      setFormData({
        item: '',
        startPrice: '',
        minPrice: '',
        decrementAmount: '10',
        decrementInterval: '1.0'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <Panel
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton onClick={onClose}>×</CloseButton>
        <Title>Admin Panel</Title>
        
        <AdminBadge>Administrator Access</AdminBadge>

        <Section>
          <SectionTitle>Chat Management</SectionTitle>
          <p style={{ color: '#bdc3c7', margin: '0 0 15px 0' }}>
            Control global chat access for all users
          </p>
          <ChatControl>
            <ChatStatus $enabled={chatEnabled}>
              Chat is {chatEnabled ? 'Enabled' : 'Disabled'}
            </ChatStatus>
            <Button
              onClick={onToggleChat}
              variant={chatEnabled ? 'danger' : 'primary'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {chatEnabled ? 'Disable Chat' : 'Enable Chat'}
            </Button>
          </ChatControl>
        </Section>

        <Section>
          <SectionTitle>Create Auction</SectionTitle>
          <p style={{ color: '#bdc3c7', margin: '0 0 15px 0' }}>
            Create new auction items for all users to bid on
          </p>
          <CreateForm onSubmit={handleSubmit}>
            <Input
              type="text"
              placeholder="Item name (e.g., 'Vintage Watch')"
              value={formData.item}
              onChange={(e) => setFormData({ ...formData, item: e.target.value })}
              required
            />
            <Input
              type="number"
              placeholder="Starting price (₩)"
              value={formData.startPrice}
              onChange={(e) => setFormData({ ...formData, startPrice: e.target.value })}
              required
            />
            <Input
              type="number"
              placeholder="Minimum price (₩)"
              value={formData.minPrice}
              onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
              required
            />
            <Input
              type="number"
              placeholder="Price decrement amount (₩)"
              value={formData.decrementAmount}
              onChange={(e) => setFormData({ ...formData, decrementAmount: e.target.value })}
            />
            <Input
              type="number"
              step="0.1"
              min="0.1"
              placeholder="Decrement interval (seconds, e.g., 0.1 for 100ms)"
              value={formData.decrementInterval}
              onChange={(e) => setFormData({ ...formData, decrementInterval: e.target.value })}
            />
            <Button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create Auction
            </Button>
          </CreateForm>
        </Section>
      </Panel>
    </Overlay>
  );
}

export default AdminPanel;