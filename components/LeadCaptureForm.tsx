'use client';

import { useState } from 'react';
import { Telemetry } from '@/lib/telemetry';
import { Button } from './Button';
import { Chip } from './Chip';

interface LeadCaptureFormProps {
  className?: string;
  onSuccess?: () => void;
  onError?: (errors: string[]) => void;
}

export function LeadCaptureForm({ className = '', onSuccess, onError }: LeadCaptureFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    medium: 'web',
    interests: [] as string[],
    consent: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  // Available career interests (you can customize this)
  const availableInterests = [
    'Ingeniería de Sistemas',
    'Ingeniería Industrial',
    'Administración de Empresas',
    'Contabilidad',
    'Derecho',
    'Medicina',
    'Enfermería',
    'Psicología',
    'Arquitectura',
    'Diseño Gráfico',
    'Marketing',
    'Finanzas',
    'Recursos Humanos',
    'Logística',
    'Turismo',
  ];

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
    setSuccess(false);
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);
    setSuccess(false);

    try {
      // Track form submission in telemetry
      Telemetry.events.push({
        type: 'custom',
        semantic: {
          label: 'Lead Form Submission Started',
          entityType: 'form',
          entityId: 'lead_capture',
          action: 'submitted',
          context: 'lead_generation',
        },
        details: {
          custom: {
            action: 'lead_form_submit',
            formData: {
              hasName: !!formData.fullName,
              hasEmail: !!formData.email,
              hasPhone: !!formData.phone,
              interestsCount: formData.interests.length,
              consent: formData.consent,
            }
          }
        }
      });

      const result = Telemetry.leads.push({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        medium: formData.medium,
        interests: formData.interests,
        consent: formData.consent,
      });

      if (result.success) {
        setSuccess(true);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          medium: 'web',
          interests: [],
          consent: false,
        });
        onSuccess?.();
        
        // Track successful submission
        Telemetry.events.push({
          type: 'custom',
          semantic: {
            label: 'Lead Form Submission Successful',
            entityType: 'form',
            entityId: 'lead_capture',
            action: 'completed',
            context: 'lead_generation',
          },
          details: {
            custom: {
              action: 'lead_form_success',
              message: 'Lead captured successfully'
            }
          }
        });
      } else {
        setErrors(result.errors || ['Unknown error occurred']);
        onError?.(result.errors || ['Unknown error occurred']);
        
        // Track validation errors
        Telemetry.events.push({
          type: 'custom',
          semantic: {
            label: 'Lead Form Validation Error',
            entityType: 'form',
            entityId: 'lead_capture',
            action: 'validation_failed',
            context: 'lead_generation',
          },
          details: {
            custom: {
              action: 'lead_form_validation_error',
              errors: result.errors
            }
          }
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrors([errorMessage]);
      onError?.([errorMessage]);
      
      // Track unexpected errors
      Telemetry.events.push({
        type: 'custom',
        semantic: {
          label: 'Lead Form Unexpected Error',
          entityType: 'form',
          entityId: 'lead_capture',
          action: 'error_occurred',
          context: 'lead_generation',
        },
        details: {
          custom: {
            action: 'lead_form_error',
            error: errorMessage
          }
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadLeads = () => {
    Telemetry.leads.download();
  };

  const handleClearLeads = () => {
    if (confirm('Are you sure you want to clear all leads data? This action cannot be undone.')) {
      Telemetry.leads.clear();
      setSuccess(false);
    }
  };

  if (success) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-6 text-center ${className}`}>
        <div className="text-green-600 text-2xl mb-2">✅</div>
        <h3 className="text-green-800 font-semibold mb-2">¡Gracias por tu interés!</h3>
        <p className="text-green-700 mb-4">
          Hemos recibido tu información correctamente. Nos pondremos en contacto contigo pronto.
        </p>
        <div className="flex gap-2 justify-center">
                      <Button
              variant="ghost"
              onClick={() => setSuccess(false)}
              className="text-green-700 border-green-300 hover:bg-green-100"
            >
              Enviar otro
            </Button>
            <Button
              variant="ghost"
              onClick={handleDownloadLeads}
              className="text-green-700 border-green-300 hover:bg-green-100"
            >
              📥 Descargar Leads
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Te interesa estudiar con nosotros?</h2>
        <p className="text-gray-600">
          Completa el formulario y nos pondremos en contacto contigo para resolver todas tus dudas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre completo *
          </label>
          <input
            type="text"
            id="fullName"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ingresa tu nombre completo"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="tu@email.com"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono (opcional)
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+51 999 888 777"
          />
        </div>

        {/* Medium */}
        <div>
          <label htmlFor="medium" className="block text-sm font-medium text-gray-700 mb-1">
            ¿Cómo te enteraste de nosotros? *
          </label>
          <select
            id="medium"
            value={formData.medium}
            onChange={(e) => handleInputChange('medium', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="web">Sitio web</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
            <option value="social">Redes sociales</option>
            <option value="friend">Recomendación</option>
            <option value="other">Otro</option>
          </select>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Carreras de interés (opcional)
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-md">
            {availableInterests.map((interest) => (
              <label key={interest} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.interests.includes(interest)}
                  onChange={() => handleInterestToggle(interest)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{interest}</span>
              </label>
            ))}
          </div>
          {formData.interests.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {formData.interests.map((interest) => (
                <Chip key={interest} className="text-xs">
                  {interest}
                </Chip>
              ))}
            </div>
          )}
        </div>

        {/* Consent */}
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="consent"
            checked={formData.consent}
            onChange={(e) => handleInputChange('consent', e.target.checked)}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            required
          />
          <label htmlFor="consent" className="text-sm text-gray-700">
            Acepto que mis datos sean procesados para fines informativos y de contacto. 
            Puedo revocar mi consentimiento en cualquier momento. *
          </label>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="text-red-800 text-sm">
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar información'}
        </Button>
      </form>

      {/* Admin Controls */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>Administración de leads:</span>
          <span>{Telemetry.leads.count()} leads capturados</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadLeads}
            className="text-xs"
          >
            📥 Descargar Leads
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearLeads}
            className="text-xs text-red-600 border-red-300 hover:bg-red-50"
          >
            🗑️ Limpiar Leads
          </Button>
        </div>
      </div>
    </div>
  );
}
