export interface Lead {

  id: string;

  name: string;
  email: string;
  phone: string;


  createdAt: number;

  formId: string | null;
  adId: string | null;


  incomplete: boolean;


  error?: string;
}


export interface LeadsResponse {

  count: number;
  total: number;
  leads: Lead[];
}