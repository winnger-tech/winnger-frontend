'use client';

import styled from 'styled-components';
import { FaCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useTranslation } from '../../utils/i18n';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

const itemFadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.8, 0.25, 1] },
  },
};

export default function PlansSection() {
  const { t } = useTranslation();

  const planKeys = ['lite', 'pro', 'proPlus'];

  const plans = planKeys.map((key) => ({
    title: t(`plans.${key}.title`),
    price: t(`plans.${key}.price`),
    description: t(`plans.${key}.description`),
    features: t(`plans.${key}.features`) as string[],
  }));

  return (
    <Wrapper id="plans">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div variants={itemFadeUp}>
          <Heading>{t('plans.heading')}</Heading>
        </motion.div>
        <motion.div variants={itemFadeUp}>
          <Subheading>{t('plans.subheading')}</Subheading>
        </motion.div>

        <CardsWrapper>
          {plans.map((plan, index) => (
            <Card key={index} $highlight={index === 1} as={motion.div} variants={itemFadeUp}>
              <CardContent>
                <Title>{plan.title}</Title>
                <Price>{plan.price}</Price>
                <Description>{plan.description}</Description>
                <FeatureList>
                  {plan.features.map((feature, i) => (
                    <Feature key={i}>
                      <FaCheck className="icon" />
                      {feature}
                    </Feature>
                  ))}
                </FeatureList>
              </CardContent>
            </Card>
          ))}
        </CardsWrapper>
      </motion.div>
    </Wrapper>
  );
}

const Wrapper = styled.section`
  padding: 80px 20px;
  background: #F4F2E9;
  text-align: center;
`;

const Heading = styled.h2`
  font-size: 36px;
  font-weight: 800;
  color: #1f1f1f;
  margin-bottom: 12px;
`;

const Subheading = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 48px;
`;

const CardsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 32px;
`;

const Card = styled.div<{ $highlight?: boolean }>`
  background: #d8a73e;
  border: 3px solid ${({ $highlight }) => ($highlight ? "#b98d2f" : "#e0bb5c")};
  box-shadow: ${({ $highlight }) =>
    $highlight
      ? "0 10px 25px rgba(0,0,0,0.2)"
      : "0 6px 16px rgba(0,0,0,0.1)"};
  border-radius: 20px;
  width: 340px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: left;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-6px);
  }
`;

const CardContent = styled.div`
  padding: 28px;
`;

const Title = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #fff;
`;

const Price = styled.p`
  font-size: 18px;
  color: #fefefe;
  margin: 8px 0 14px;
`;

const Description = styled.p`
  font-size: 15px;
  color: #ffffffd1;
  margin-bottom: 20px;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding-left: 0;
`;

const Feature = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ffffffee;
  font-size: 15px;
  margin-bottom: 10px;

  .icon {
    color: #ffffff;
    background: #3c3c3c;
    border-radius: 50%;
    padding: 3px;
    font-size: 12px;
  }
`;