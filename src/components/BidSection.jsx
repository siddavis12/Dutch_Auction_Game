import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const shake = keyframes`
  0%, 100% { transform: translateY(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateY(-2px); }
  20%, 40%, 60%, 80% { transform: translateY(2px); }
`;

const BidWrapper = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 20px;
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
  
  &.price-drop {
    animation: ${shake} 0.5s ease-in-out;
    border-color: rgba(231, 76, 60, 0.8);
    box-shadow: 0 0 30px rgba(231, 76, 60, 0.4);
  }
`;

const AuctionInfo = styled.div`
  color: white;
  margin-bottom: 15px;
  position: relative;
`;

const PriceDropIndicator = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 36px;
  font-weight: bold;
  color: #e74c3c;
  text-shadow: 0 0 20px rgba(231, 76, 60, 0.8);
  pointer-events: none;
  z-index: 10;
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
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 20px rgba(243, 156, 18, 0.4);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const WarningBox = styled(motion.div)`
  background: rgba(231, 76, 60, 0.9);
  padding: 15px;
  border-radius: 10px;
  border: 2px solid #e74c3c;
  max-width: 200px;
  box-shadow: 0 4px 20px rgba(231, 76, 60, 0.3);
`;

const WarningText = styled.div`
  font-size: 13px;
  color: white;
  line-height: 1.5;
  font-weight: 500;
  text-align: left;
`;

function BidSection({ auction, onBid }) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [currentAuctionId, setCurrentAuctionId] = React.useState(null);
  const [prevPrice, setPrevPrice] = React.useState(null);
  const [isPriceChanging, setIsPriceChanging] = React.useState(false);
  const [isDiscountChanging, setIsDiscountChanging] = React.useState(false);
  const [showPriceDrop, setShowPriceDrop] = React.useState(false);
  const [priceDropAmount, setPriceDropAmount] = React.useState(0);

  React.useEffect(() => {
    if (auction && auction.id !== currentAuctionId) {
      // 새로운 경매가 시작됨
      setIsVisible(true);
      setCurrentAuctionId(auction.id);
      setPrevPrice(auction.currentPrice);
    } else if (!auction && currentAuctionId) {
      // 경매가 종료됨
      setIsVisible(false);
      setCurrentAuctionId(null);
      setPrevPrice(null);
    }
  }, [auction?.id, currentAuctionId]);

  // 가격 변화 감지
  React.useEffect(() => {
    if (auction && prevPrice !== null && auction.currentPrice !== prevPrice) {
      const dropAmount = prevPrice - auction.currentPrice;
      
      // 1초(1000ms) 이하일 때는 애니메이션 비활성화
      const shouldAnimate = !auction.decrementInterval || auction.decrementInterval >= 1000;
      
      if (shouldAnimate) {
        setIsPriceChanging(true);
        setIsDiscountChanging(true);
        setPriceDropAmount(dropAmount);
        setShowPriceDrop(true);
      }
      
      setPrevPrice(auction.currentPrice);
      
      if (shouldAnimate) {
        // 애니메이션 후 상태 리셋
        const priceTimer = setTimeout(() => setIsPriceChanging(false), 600);
        const discountTimer = setTimeout(() => setIsDiscountChanging(false), 400);
        const dropTimer = setTimeout(() => setShowPriceDrop(false), 800);
        
        return () => {
          clearTimeout(priceTimer);
          clearTimeout(discountTimer);
          clearTimeout(dropTimer);
        };
      }
    }
  }, [auction?.currentPrice, prevPrice, auction?.decrementInterval]);

  if (!isVisible || !auction) return null;

  const discountPercentage = ((auction.startPrice - auction.currentPrice) / auction.startPrice * 100).toFixed(2);

  return (
    <BidWrapper onClick={(e) => e.stopPropagation()}>
      <Container
        key={currentAuctionId}
        className={(isPriceChanging && (!auction.decrementInterval || auction.decrementInterval >= 1000)) ? 'price-drop' : ''}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
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
                ₩{parseInt(auction.currentPrice).toLocaleString('ko-KR')}
              </CurrentPrice>
            </AnimatePresence>
          ) : (
            <CurrentPrice
              style={{ transform: 'none', opacity: 1 }}
            >
              ₩{parseInt(auction.currentPrice).toLocaleString('ko-KR')}
            </CurrentPrice>
          )}
          {auction.currentPrice < auction.startPrice && (
            <DiscountPercentage
              className={(isDiscountChanging && (!auction.decrementInterval || auction.decrementInterval >= 1000)) ? 'discount-update' : ''}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {discountPercentage}% off
            </DiscountPercentage>
          )}
          <AnimatePresence>
            {showPriceDrop && (
              <PriceDropIndicator
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -40, scale: 1 }}
                exit={{ opacity: 0, y: -60, scale: 0.8 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                -₩{parseInt(priceDropAmount).toLocaleString('ko-KR')}
              </PriceDropIndicator>
            )}
          </AnimatePresence>
        </AuctionInfo>
        <BidButton onClick={() => onBid(auction.id)}>
          Place Bid
        </BidButton>
      </Container>
      <WarningBox
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <WarningText>
          ⚠️ 버튼을 누르면 확인과정 없이 바로 입찰이 진행됩니다. 신중하게 클릭하세요!
        </WarningText>
      </WarningBox>
    </BidWrapper>
  );
}

export default React.memo(BidSection);