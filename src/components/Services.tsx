import { Scissors, ShoppingBag, Calendar, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { motion } from 'framer-motion';

export function Services() {
  const services = [
    {
      icon: Scissors,
      title: 'Découpe Personnalisée',
      description: 'Nous découpons vos viandes selon vos préférences et vos besoins spécifiques',
      features: ['Découpe sur mesure', 'Conseils personnalisés', 'Préparation rapide']
    },
    {
      icon: ShoppingBag,
      title: 'Livraison à Domicile',
      description: 'Commandez en ligne et recevez vos achats frais directement chez vous',
      features: ['Livraison rapide', 'Produits frais garantis', 'Zone de livraison étendue']
    },
    {
      icon: Calendar,
      title: 'Click & Collect',
      description: 'Commandez en ligne et récupérez en boutique à l\'heure de votre choix',
      features: ['Réservation en ligne', 'Retrait rapide', 'Flexibilité horaire']
    }
  ];

  return (
    <section id="services" className="py-20 bg-white/90 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Nos Services
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Comment nous vous servons
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Des services adaptés à vos besoins pour une expérience d'achat optimale
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card className="hover:shadow-2xl transition-all duration-500 flex flex-col hover-lift border-2 hover:border-primary/30 h-full">
                  <CardHeader>
                    <motion.div
                      className="flex justify-center mb-4"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Icon className="w-10 h-10 text-primary relative z-10" />
                      </div>
                    </motion.div>
                    <CardTitle className="text-center text-xl">{service.title}</CardTitle>
                    <CardDescription className="text-center">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <motion.li
                          key={idx}
                          className="flex items-center gap-2 text-sm"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.2 + idx * 0.1 }}
                        >
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
