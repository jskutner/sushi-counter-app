export interface IndividualOrder {
  id: string;
  name: string;
  threeRollCombo?: string[];
  singleRoll?: string;
  beverage?: string;
  misoSoup: boolean;
  total: number;
  packaged: boolean;
  paid: boolean;
}

export interface Order {
  id: string;
  date: string;
  venmoId: string;
  orders: IndividualOrder[];
  status: 'active' | 'completed';
}

export interface MenuItem {
  id: string;
  name: string;
  image?: string;
  description?: string;
}

export const BEVERAGES = [
  'Matcha lemonade',
  'Yuzu lemonade',
  'Lemon lime & bitters'
];

export const PRICES = {
  THREE_ROLL_COMBO: 12,
  SINGLE_ROLL: 5,
  BEVERAGE: 3,
  MISO_SOUP: 2
};
