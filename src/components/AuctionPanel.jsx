import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import AdminPanel from './AdminPanel';
import { formatPrice } from '../utils/currency';

const Container = styled.div`
  grid-column: 1;
  grid-row: 1 / 3;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 20px;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  box-sizing: border-box;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  color: #f39c12;
  margin: 0;
  font-size: 20px;
`;

const AdminButton = styled(motion.button)`
  background: none;
  border: none;
  color: #f39c12;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  
  &:hover {
    background: rgba(243, 156, 18, 0.1);
  }
`;

const CreateForm = styled.form`
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 5px 0;
  border: none;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: none;
  border-radius: 5px;
  background: ${props => props.variant === 'primary' ? '#f39c12' : '#27ae60'};
  color: white;
  font-weight: bold;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AuctionItem = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  margin: 10px 0;
  border-radius: 10px;
  border: 2px solid ${props => props.active ? '#f39c12' : 'transparent'};
`;

const ItemName = styled.h3`
  margin: 0 0 10px 0;
  color: #fff;
`;

const PriceDisplay = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.active ? '#f39c12' : '#95a5a6'};
  margin: 10px 0;
`;

const PriceBar = styled.div`
  width: 100%;
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  overflow: hidden;
  margin: 10px 0;
`;

const PriceProgress = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #e74c3c, #f39c12);
`;

const WinnerInfo = styled.div`
  color: #27ae60;
  font-weight: bold;
  margin-top: 10px;
`;

function AuctionPanel({ auctions, onCreateAuction, onStartAuction, onBid, isAdmin, onToggleChat, chatEnabled }) {
  const [showCreate, setShowCreate] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [formData, setFormData] = useState({
    item: '',
    startPrice: '',
    minPrice: '',
    decrementAmount: '',
    decrementInterval: ''
  });

  console.log('AuctionPanel isAdmin:', isAdmin);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.item && formData.startPrice && formData.minPrice) {
      onCreateAuction({
        item: formData.item,
        startPrice: parseInt(formData.startPrice),
        minPrice: parseInt(formData.minPrice),
        decrementAmount: formData.decrementAmount ? parseInt(formData.decrementAmount) : undefined,
        decrementInterval: formData.decrementInterval ? Math.round(parseFloat(formData.decrementInterval) * 1000) : undefined
      });
      setFormData({ 
        item: '', 
        startPrice: '', 
        minPrice: '', 
        decrementAmount: '', 
        decrementInterval: '' 
      });
      setShowCreate(false);
    }
  };

  return (
    <Container>
      <TitleContainer>
        <Title>Auctions</Title>
        {isAdmin && (
          <AdminButton
            onClick={() => setShowAdmin(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Admin Panel"
          >
            ⚙️
          </AdminButton>
        )}
      </TitleContainer>
      
      {isAdmin && (
        <Button
          variant="primary"
          onClick={() => setShowCreate(!showCreate)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showCreate ? 'Cancel' : 'Create Auction'}
        </Button>
      )}

      <AnimatePresence>
        {showCreate && isAdmin && (
          <CreateForm onSubmit={handleSubmit}>
            <Input
              type="text"
              placeholder="Item name"
              value={formData.item}
              onChange={(e) => setFormData({ ...formData, item: e.target.value })}
              required
            />
            <Input
              type="number"
              placeholder="Start price (₩)"
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
              placeholder="Price decrement amount (₩) - optional"
              value={formData.decrementAmount}
              onChange={(e) => setFormData({ ...formData, decrementAmount: e.target.value })}
            />
            <Input
              type="number"
              step="0.1"
              min="0.1"
              placeholder="Decrement interval (seconds) - optional, e.g., 0.1 for fast auctions"
              value={formData.decrementInterval}
              onChange={(e) => setFormData({ ...formData, decrementInterval: e.target.value })}
            />
            <Button type="submit" variant="primary">Create</Button>
          </CreateForm>
        )}
      </AnimatePresence>

      {auctions.map((auction) => (
        <AuctionItem
          key={auction.id}
          active={auction.isActive}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ItemName>{auction.item}</ItemName>
          <PriceDisplay active={auction.isActive}>
            {formatPrice(auction.currentPrice || auction.startPrice)}
          </PriceDisplay>
          
          {auction.startPrice && (
            <PriceBar>
              <PriceProgress
                animate={{
                  width: `${((auction.currentPrice - auction.minPrice) / 
                    (auction.startPrice - auction.minPrice)) * 100}%`
                }}
                transition={{ duration: 0.3 }}
              />
            </PriceBar>
          )}

          {!auction.isActive && !auction.winner && (
            <Button
              onClick={() => onStartAuction(auction.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Auction
            </Button>
          )}

          {auction.isActive && (
            <Button
              variant="primary"
              onClick={() => onBid(auction.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              BID NOW!
            </Button>
          )}

          {auction.winner && (
            <WinnerInfo>
              Won by {auction.winnerName} for {formatPrice(auction.finalPrice)}
            </WinnerInfo>
          )}
        </AuctionItem>
      ))}
      
      <AdminPanel
        isOpen={showAdmin}
        onClose={() => setShowAdmin(false)}
        onCreateAuction={onCreateAuction}
        onToggleChat={onToggleChat}
        chatEnabled={chatEnabled}
      />
    </Container>
  );
}

export default AuctionPanel;