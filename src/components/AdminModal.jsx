import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled(motion.div)`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid rgba(243, 156, 18, 0.3);
  border-radius: 20px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h2`
  color: #f39c12;
  margin: 0 0 20px 0;
  text-align: center;
  font-size: 24px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: #f39c12;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const Section = styled.div`
  margin-bottom: 25px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
`;

const SectionTitle = styled.h3`
  color: #f39c12;
  margin: 0 0 15px 0;
  font-size: 18px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(243, 156, 18, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  margin-bottom: 10px;
  
  &:focus {
    outline: none;
    border-color: #f39c12;
    background: rgba(255, 255, 255, 0.15);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 12px 20px;
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ToggleButton = styled(Button)`
  background: ${props => props.$enabled ? 
    'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' : 
    'linear-gradient(135deg, #27ae60 0%, #229954 100%)'};
`;

const AuctionItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 15px;
  margin: 10px 0;
  border-radius: 8px;
  border-left: 3px solid ${props => props.isActive ? '#27ae60' : '#95a5a6'};
`;

const AuctionInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const AuctionName = styled.div`
  color: white;
  font-weight: bold;
`;

const AuctionPrice = styled.div`
  color: #2ecc71;
  font-weight: bold;
`;

const StartButton = styled(Button)`
  width: auto;
  padding: 8px 16px;
  font-size: 14px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
`;

function AdminModal({ isOpen, onClose, auctions, onCreateAuction, onStartAuction, onToggleChat, chatEnabled }) {
  const [itemName, setItemName] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [decrementAmount, setDecrementAmount] = useState('10');
  const [decrementInterval, setDecrementInterval] = useState('1.0');
  const [countdownDuration, setCountdownDuration] = useState('3');

  const handleCreateAuction = () => {
    if (itemName && startingPrice) {
      onCreateAuction({
        item: itemName,
        startPrice: parseInt(startingPrice),
        minPrice: 0, // 최소 가격을 0으로 설정
        decrementAmount: parseInt(decrementAmount) || 10,
        decrementInterval: Math.round(parseFloat(decrementInterval) * 1000) || 1000
      });
      setItemName('');
      setStartingPrice('');
      setDecrementAmount('10');
      setDecrementInterval('1.0');
    }
  };

  const activeAuctions = auctions.filter(a => a.isActive);
  const pendingAuctions = auctions.filter(a => !a.isActive && !a.winner);

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <Modal
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <CloseButton onClick={onClose}>✕</CloseButton>
            <Title>⚙️ Admin Panel</Title>

            <Section>
              <SectionTitle>Create New Auction</SectionTitle>
              <Input
                type="text"
                placeholder="Item name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Starting price"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Decrement amount (default: 10)"
                value={decrementAmount}
                onChange={(e) => setDecrementAmount(e.target.value)}
              />
              <Input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="Decrement interval in seconds (e.g., 0.1 for fast auctions)"
                value={decrementInterval}
                onChange={(e) => setDecrementInterval(e.target.value)}
              />
              <Button
                onClick={handleCreateAuction}
                disabled={!itemName || !startingPrice}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Create Auction
              </Button>
            </Section>

            <Section>
              <SectionTitle>Auction Settings</SectionTitle>
              <Input
                type="number"
                placeholder="Countdown duration in seconds (default: 3)"
                value={countdownDuration}
                onChange={(e) => setCountdownDuration(e.target.value)}
                min="1"
                max="10"
              />
              <div style={{ color: '#95a5a6', fontSize: '12px', marginBottom: '15px' }}>
                Set countdown timer for auction start (1-10 seconds)
              </div>
            </Section>

            <Section>
              <SectionTitle>Manage Auctions</SectionTitle>
              {activeAuctions.length > 0 && (
                <>
                  <h4 style={{ color: '#27ae60', marginBottom: '10px' }}>Active Auctions</h4>
                  {activeAuctions.map(auction => (
                    <AuctionItem key={auction.id} isActive>
                      <AuctionInfo>
                        <AuctionName>{auction.item}</AuctionName>
                        <AuctionPrice>₩{parseInt(auction.currentPrice).toLocaleString('ko-KR')}</AuctionPrice>
                      </AuctionInfo>
                    </AuctionItem>
                  ))}
                </>
              )}

              {pendingAuctions.length > 0 && (
                <>
                  <h4 style={{ color: '#95a5a6', marginBottom: '10px', marginTop: '15px' }}>Pending Auctions</h4>
                  {pendingAuctions.map(auction => (
                    <AuctionItem key={auction.id}>
                      <AuctionInfo>
                        <AuctionName>{auction.item}</AuctionName>
                        <AuctionPrice>₩{parseInt(auction.startPrice).toLocaleString('ko-KR')}</AuctionPrice>
                      </AuctionInfo>
                      <StartButton
                        onClick={() => {
                          onStartAuction(auction.id, parseInt(countdownDuration) || 3);
                          onClose(); // Close the modal after starting auction
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Start Auction
                      </StartButton>
                    </AuctionItem>
                  ))}
                </>
              )}

              {auctions.length === 0 && (
                <div style={{ color: '#95a5a6', textAlign: 'center', fontStyle: 'italic' }}>
                  No auctions created yet
                </div>
              )}
            </Section>

            <Section>
              <SectionTitle>Chat Management</SectionTitle>
              <ToggleButton
                $enabled={chatEnabled}
                onClick={onToggleChat}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {chatEnabled ? 'Disable Chat' : 'Enable Chat'}
              </ToggleButton>
              <div style={{ color: '#95a5a6', fontSize: '12px', marginTop: '10px', textAlign: 'center' }}>
                Chat is currently {chatEnabled ? 'enabled' : 'disabled'}
              </div>
            </Section>
          </Modal>
        </Overlay>
      )}
    </AnimatePresence>
  );
}

export default AdminModal;