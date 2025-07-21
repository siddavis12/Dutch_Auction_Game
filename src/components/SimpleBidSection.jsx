import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../utils/currency';

const BidWrapper = styled.div`
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 50;
`;

const Container = styled(motion.div)`
  background: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border-radius: 15px;
  border: 2px solid rgba(243, 156, 18, 0.5);
  min-width: 300px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  overflow: visible;
`;

const AuctionInfo = styled.div`
  color: white;
  margin-bottom: 15px;
  position: relative;
`;


const ItemName = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #f39c12;
  margin-bottom: 5px;
`;

const priceChangeGlow = keyframes`
  0% {
    text-shadow: 0 0 10px rgba(46, 204, 113, 0.8),
                 0 0 20px rgba(46, 204, 113, 0.6),
                 0 0 30px rgba(46, 204, 113, 0.4);
    transform: scale(1);
  }
  50% {
    text-shadow: 0 0 20px rgba(46, 204, 113, 1),
                 0 0 40px rgba(46, 204, 113, 0.8),
                 0 0 60px rgba(46, 204, 113, 0.6);
    transform: scale(1.1);
  }
  100% {
    text-shadow: 0 0 10px rgba(46, 204, 113, 0.8),
                 0 0 20px rgba(46, 204, 113, 0.6),
                 0 0 30px rgba(46, 204, 113, 0.4);
    transform: scale(1);
  }
`;

const CurrentPrice = styled(motion.div)`
  font-size: 24px;
  color: #2ecc71;
  font-weight: bold;
  display: inline-block;
  
  &.price-changing {
    animation: ${priceChangeGlow} 0.6s ease-out;
  }
`;

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const DiscountPercentage = styled(motion.div)`
  font-size: 14px;
  color: #e74c3c;
  margin-top: 5px;
  font-weight: bold;
  
  &.discount-update {
    animation: ${pulseAnimation} 0.4s ease-out;
  }
`;

const BidButton = styled.button`
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    box-shadow: 0 5px 20px rgba(243, 156, 18, 0.4);
    background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const HoverIndicator = styled(motion.div)`
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(231, 76, 60, 0.9);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  color: white;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
`;

const WarningBox = styled(motion.div)`
  background: rgba(231, 76, 60, 0.15);
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid rgba(231, 76, 60, 0.3);
  max-width: 400px;
  backdrop-filter: blur(10px);
  margin-top: 30px;
`;

const WarningText = styled.div`
  font-size: 12px;
  color: #e74c3c;
  line-height: 1.4;
  font-weight: 500;
  text-align: center;
`;

function SimpleBidSection({ auction, onBid, socket, hoverCount }) {
  // auction ID를 state로 저장하여 애니메이션 key로 사용
  const [displayedAuctionId, setDisplayedAuctionId] = React.useState(null);
  const [prevPrice, setPrevPrice] = React.useState(null);
  const [isPriceChanging, setIsPriceChanging] = React.useState(false);
  const [isDiscountChanging, setIsDiscountChanging] = React.useState(false);
  
  // auction이 변경될 때만 displayedAuctionId 업데이트
  React.useEffect(() => {
    if (auction?.id && auction.id !== displayedAuctionId) {
      setDisplayedAuctionId(auction.id);
      setPrevPrice(auction.currentPrice);
    } else if (!auction) {
      setDisplayedAuctionId(null);
      setPrevPrice(null);
    }
  }, [auction?.id, displayedAuctionId]);

  // 가격 변화 감지
  React.useEffect(() => {
    if (auction && prevPrice !== null && auction.currentPrice !== prevPrice) {
      // 1초(1000ms) 이하일 때는 애니메이션 비활성화
      const shouldAnimate = !auction.decrementInterval || auction.decrementInterval >= 1000;
      
      if (shouldAnimate) {
        setIsPriceChanging(true);
        setIsDiscountChanging(true);
      }
      
      setPrevPrice(auction.currentPrice);
      
      if (shouldAnimate) {
        // 애니메이션 후 상태 리셋
        const priceTimer = setTimeout(() => setIsPriceChanging(false), 600);
        const discountTimer = setTimeout(() => setIsDiscountChanging(false), 400);
        
        return () => {
          clearTimeout(priceTimer);
          clearTimeout(discountTimer);
        };
      }
    }
  }, [auction?.currentPrice, prevPrice, auction?.decrementInterval]);

  if (!auction || !displayedAuctionId) return null;

  const discountPercentage = ((auction.startPrice - auction.currentPrice) / auction.startPrice * 100).toFixed(2);
  
  const handleMouseEnter = () => {
    if (socket) {
      socket.emit('bidHoverStart');
    }
  };
  
  const handleMouseLeave = () => {
    if (socket) {
      socket.emit('bidHoverEnd');
    }
  };

  return (
    <BidWrapper onClick={(e) => e.stopPropagation()}>
      <Container
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        style={{ position: 'relative' }}
      >
          <AuctionInfo>
            <ItemName>{auction.item}</ItemName>
            {(!auction.decrementInterval || auction.decrementInterval >= 1000) ? (
              <AnimatePresence mode="wait">
                <CurrentPrice
                  key={auction.currentPrice}
                  className={isPriceChanging ? 'price-changing' : ''}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {formatPrice(auction.currentPrice)}
                </CurrentPrice>
              </AnimatePresence>
            ) : (
              <CurrentPrice
                style={{ transform: 'none', opacity: 1 }}
              >
                {formatPrice(auction.currentPrice)}
              </CurrentPrice>
            )}
            <DiscountPercentage
              className={(isDiscountChanging && (!auction.decrementInterval || auction.decrementInterval >= 1000)) ? 'discount-update' : ''}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {discountPercentage}% off
            </DiscountPercentage>
          </AuctionInfo>
          <BidButton 
            onClick={() => onBid(auction.id)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            Place Bid
          </BidButton>
          <AnimatePresence>
            {hoverCount > 0 && (
              <HoverIndicator
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                👀 {hoverCount}명이 관심중
              </HoverIndicator>
            )}
          </AnimatePresence>
        </Container>
        <WarningBox
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <WarningText>
            ⚠️ Bid 버튼을 누르면 확인과정 없이 바로 입찰이 진행됩니다.<br />
            신중하게 클릭하세요!
          </WarningText>
        </WarningBox>
      </BidWrapper>
  );
}

export default SimpleBidSection;