
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ClientInfo {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  industry: string;
}

interface ClientInformationProps {
  clientInfo: ClientInfo;
  onInputChange: (field: string, value: string) => void;
}

const ClientInformation: React.FC<ClientInformationProps> = ({
  clientInfo,
  onInputChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Information</CardTitle>
        <CardDescription>Enter details about your client</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={clientInfo.company_name}
              onChange={(e) => onInputChange('company_name', e.target.value)}
              placeholder="Acme Corp"
            />
          </div>
          <div>
            <Label htmlFor="contact_name">Contact Name</Label>
            <Input
              id="contact_name"
              value={clientInfo.contact_name}
              onChange={(e) => onInputChange('contact_name', e.target.value)}
              placeholder="John Smith"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={clientInfo.email}
              onChange={(e) => onInputChange('email', e.target.value)}
              placeholder="john@acme.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={clientInfo.phone}
              onChange={(e) => onInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            value={clientInfo.industry}
            onChange={(e) => onInputChange('industry', e.target.value)}
            placeholder="Technology"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientInformation;
