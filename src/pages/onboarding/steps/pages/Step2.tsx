import { useState } from 'react';
import StepLayout from '../layouts/StepLayout';
import {
  TextInput,
  Select,
  SelectItem,
  InlineNotification,
} from '@carbon/react';

export default function Step2() {
  const [pharmacyName, setPharmacyName] = useState('');
  const [city, setCity] = useState('');
  const [otherCity, setOtherCity] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Store form data in localStorage for StepLayout to access
  const handleFieldChange = () => {
    const formData = {
      pharmacyName,
      city: city === 'other' ? otherCity : city,
      phone,
      address,
    };
    localStorage.setItem('onboarding_step2', JSON.stringify(formData));
  };

  return (
    <StepLayout currentStep={1}>
      <div className="flex flex-col mt-6 px-6 py-8">
        <div>
          <h1 className="text-4xl font-extralight mb-3">Pharmacy Setup</h1>
          <p className="mb-8 text-xl font-extralight">
            Tell us a few things about your pharmacy
          </p>
        </div>

        {error && (
          <InlineNotification
            kind="error"
            title="Error"
            subtitle={error}
            onCloseButtonClick={() => setError(null)}
            className="mb-6"
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            id="pharmacy-name"
            labelText="Pharmacy name"
            placeholder="Enter Pharmacy name"
            size="lg"
            value={pharmacyName}
            onChange={(e) => {
              setPharmacyName(e.target.value);
              handleFieldChange();
            }}
          />

          <Select
            id="city"
            labelText="City"
            size="lg"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              handleFieldChange();
            }}
          >
            <SelectItem value="" text="Select city" />
            <SelectItem value="addis-ababa" text="Addis Ababa" />
            <SelectItem value="dire-dawa" text="Dire Dawa" />
            <SelectItem value="mekelle" text="Mekelle" />
            <SelectItem value="gondar" text="Gondar" />
            <SelectItem value="hawassa" text="Hawassa" />
            <SelectItem value="bahir-dar" text="Bahir Dar" />
            <SelectItem value="other" text="Other (enter manually)" />
          </Select>

          {city === 'other' && (
            <TextInput
              id="city-other"
              labelText="City (custom)"
              placeholder="Enter your city"
              size="lg"
              value={otherCity}
              onChange={(e) => {
                setOtherCity(e.target.value);
                handleFieldChange();
              }}
            />
          )}

          <TextInput
            id="phone"
            labelText="Phone Number"
            placeholder="Enter Phone Number"
            className="md:col-span-2"
            size="lg"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              handleFieldChange();
            }}
          />

          <TextInput
            id="address"
            labelText="Physical Address"
            placeholder="Enter street address"
            className="md:col-span-2"
            size="lg"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              handleFieldChange();
            }}
          />
        </div>
      </div>
    </StepLayout>
  );
}
