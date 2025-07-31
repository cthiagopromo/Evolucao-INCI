import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSound } from '@/hooks/useSound';
import inciLogo from '@/assets/inci-logo.png';

interface UserRegistrationProps {
  onStart: (userData: { name: string; email: string; whatsapp: string; cnpj?: string; empresa?: string; cargo?: string }) => void;
  className?: string;
}

export const UserRegistration = ({ onStart, className }: UserRegistrationProps) => {
  const { playSound } = useSound();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [cargo, setCargo] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; whatsapp?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; whatsapp?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!whatsapp.trim()) {
      newErrors.whatsapp = 'WhatsApp é obrigatório';
    } else if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(whatsapp)) {
      newErrors.whatsapp = 'WhatsApp inválido (ex: (11) 99999-9999)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      playSound('start');
      onStart({ 
        name: name.trim(), 
        email: email.trim(), 
        whatsapp: whatsapp.trim(),
        cnpj: cnpj.trim() || undefined,
        empresa: empresa.trim() || undefined,
        cargo: cargo.trim() || undefined
      });
    }
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-background p-4", className)}>
      <Card className="w-full max-w-md shadow-lg border-2 border-inci-blue/20">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="mx-auto w-24 h-8 sm:w-28 sm:h-28 md:w-40 md:h-16 flex items-center justify-center">
            <img 
              src={inciLogo} 
              alt="INCI Logo" 
              className="w-full h-24 object-contain"
            />
          </div>
          
          <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-inci-blue leading-tight">
            Evolução INCI
          </CardTitle>
          
          <CardDescription className="text-sm sm:text-base text-foreground px-2">
            Teste suas habilidades de tomada de decisão em cenários empresariais reais.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-inci-blue">
                Nome Completo
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cn(
                  "border-2 focus:border-inci-blue h-11 sm:h-10",
                  errors.name && "border-destructive"
                )}
                placeholder="Digite seu nome"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-inci-blue">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "border-2 focus:border-inci-blue h-11 sm:h-10",
                  errors.email && "border-destructive"
                )}
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-sm font-medium text-inci-blue">
                WhatsApp
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 11) {
                    value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                  } else if (value.length >= 7) {
                    value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
                  } else if (value.length >= 3) {
                    value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
                  }
                  setWhatsapp(value);
                }}
                className={cn(
                  "border-2 focus:border-inci-blue h-11 sm:h-10",
                  errors.whatsapp && "border-destructive"
                )}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
              {errors.whatsapp && (
                <p className="text-sm text-destructive">{errors.whatsapp}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj" className="text-sm font-medium text-inci-blue">
                CNPJ (Opcional)
              </Label>
              <Input
                id="cnpj"
                type="text"
                value={cnpj}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 14) {
                    value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
                  } else if (value.length >= 12) {
                    value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
                  } else if (value.length >= 8) {
                    value = value.replace(/(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
                  } else if (value.length >= 5) {
                    value = value.replace(/(\d{2})(\d{0,3})/, '$1.$2');
                  }
                  setCnpj(value);
                }}
                className="border-2 focus:border-inci-blue h-11 sm:h-10"
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="empresa" className="text-sm font-medium text-inci-blue">
                Empresa (Opcional)
              </Label>
              <Input
                id="empresa"
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="border-2 focus:border-inci-blue h-11 sm:h-10"
                placeholder="Nome da empresa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo" className="text-sm font-medium text-inci-blue">
                Cargo (Opcional)
              </Label>
              <Input
                id="cargo"
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="border-2 focus:border-inci-blue h-11 sm:h-10"
                placeholder="Seu cargo"
              />
            </div>

            <div className="space-y-3 pt-2">
              <Button 
                type="submit"
                className="w-full bg-inci-blue hover:bg-inci-blue-dark text-white h-11 sm:h-10 text-base sm:text-lg font-semibold"
              >
                Iniciar Simulação
              </Button>
              
              <div className="text-center text-xs text-muted-foreground px-2">
                <p>Seus dados serão usados apenas para o ranking do evento</p>
              </div>
            </div>
          </form>

          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
            <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl">💰</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Finanças</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl">📢</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Marketing</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl">👥</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground leading-tight">RH</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl">⚙️</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Estratégia</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};