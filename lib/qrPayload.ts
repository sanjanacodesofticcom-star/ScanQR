export interface BankOption {
  id: string;
  name: string;
  vpaSuffix: string;
  payeePrefix: string;
}

export const SUPPORTED_BANKS: BankOption[] = [
  {
    id: 'axis',
    name: 'Axis Bank',
    vpaSuffix: '@Axisbank',
    payeePrefix: 'Axis Bank Credit Card',
  },
  {
    id: 'sbi',
    name: 'State Bank of India',
    vpaSuffix: '@sbi',
    payeePrefix: 'SBI Credit Card',
  },
  {
    id: 'hdfc',
    name: 'HDFC Bank',
    vpaSuffix: '@hdfcbank',
    payeePrefix: 'HDFC Bank Credit Card',
  },
  {
    id: 'icici',
    name: 'ICICI Bank',
    vpaSuffix: '@icici',
    payeePrefix: 'ICICI Bank Credit Card',
  },
  {
    id: 'kotak',
    name: 'Kotak Mahindra Bank',
    vpaSuffix: '@kotak',
    payeePrefix: 'Kotak Credit Card',
  },
  {
    id: 'indusind',
    name: 'IndusInd Bank',
    vpaSuffix: '@indus',
    payeePrefix: 'IndusInd Credit Card',
  },
  {
    id: 'bob',
    name: 'Bank of Baroda',
    vpaSuffix: '@barodampay',
    payeePrefix: 'BOB Credit Card',
  },
  {
    id: 'rbl',
    name: 'RBL Bank',
    vpaSuffix: '@rbl',
    payeePrefix: 'RBL Credit Card',
  },
  {
    id: 'idfc',
    name: 'IDFC FIRST Bank',
    vpaSuffix: '@idfcbank',
    payeePrefix: 'IDFC Credit Card',
  },
  {
    id: 'au',
    name: 'AU Small Finance Bank',
    vpaSuffix: '@aubank',
    payeePrefix: 'AU Bank Credit Card',
  },
  {
    id: 'federal',
    name: 'Federal Bank',
    vpaSuffix: '@federal',
    payeePrefix: 'Federal Bank Credit Card',
  },
  {
    id: 'yes',
    name: 'YES Bank',
    vpaSuffix: '@yesbank',
    payeePrefix: 'YES Bank Credit Card',
  },
];

export interface QRPayloadData {
  name: string;
  mobileNumber: string;
  cardNumber: string; // 4-digit card number
  bankId: string;
}

export interface PaymentDetails {
  combinedId: string;
  payeeName: string;
  name: string;
  mobileNumber: string;
  cardNumber: string;
  bankName: string;
  currency: string;
  rawUri: string;
}

/**
 * Generates the combined Credit Card UPI ID.
 * Format: Cc.91<10-digit-mobile><4-digit-card><@bank-vpa>
 * Example: Cc.9195691999008696@Axisbank
 */
export function generateCombinedVpa(
  mobileNumber: string,
  cardNumber: string,
  bankId: string = 'axis'
): string {
  let cleanMobile = (mobileNumber || '').replace(/\D/g, '').trim();
  const cleanCard = (cardNumber || '').replace(/\D/g, '').trim();
  const bank = SUPPORTED_BANKS.find((b) => b.id === bankId) || SUPPORTED_BANKS[0];

  // Prepend India country code 91 for 10-digit mobile numbers
  if (cleanMobile.length === 10) {
    cleanMobile = `91${cleanMobile}`;
  }

  return `Cc.${cleanMobile}${cleanCard}${bank.vpaSuffix}`;
}

/**
 * Formats Payee Name for the UPI payment screen.
 */
export function formatPayeeName(
  name: string,
  cardNumber: string,
  bankId: string = 'axis'
): string {
  const trimmedName = (name || '').trim();
  if (trimmedName) {
    return trimmedName;
  }
  const bank = SUPPORTED_BANKS.find((b) => b.id === bankId) || SUPPORTED_BANKS[0];
  const cleanCard = (cardNumber || '').replace(/\D/g, '').trim();
  if (cleanCard) {
    return `${bank.name} CC Ending ${cleanCard}`;
  }
  return `${bank.name} Credit Card`;
}

/**
 * Generates the standard NPCI UPI Payment URI string.
 * Output format: upi://pay?pa=Cc.9195691999008696@Axisbank&pn=Abhinandan
 */
export function generateQRPayload(data: QRPayloadData): string {
  const combinedVpa = generateCombinedVpa(data.mobileNumber, data.cardNumber, data.bankId);
  const payeeName = formatPayeeName(data.name, data.cardNumber, data.bankId);
  const encodedName = encodeURIComponent(payeeName);

  return `upi://pay?pa=${combinedVpa}&pn=${encodedName}`;
}

/**
 * Retrieves payment preview details.
 */
export function getPaymentDetails(data: QRPayloadData): PaymentDetails {
  const bank = SUPPORTED_BANKS.find((b) => b.id === data.bankId) || SUPPORTED_BANKS[0];
  const combinedId = generateCombinedVpa(data.mobileNumber, data.cardNumber, data.bankId);
  const payeeName = formatPayeeName(data.name, data.cardNumber, data.bankId);
  const rawUri = generateQRPayload(data);

  return {
    combinedId,
    payeeName,
    name: (data.name || '').trim(),
    mobileNumber: (data.mobileNumber || '').replace(/\D/g, '').trim(),
    cardNumber: (data.cardNumber || '').replace(/\D/g, '').trim(),
    bankName: bank.name,
    currency: 'INR',
    rawUri,
  };
}
