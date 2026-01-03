import { MapPin, Phone, Mail, Clock, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export function Contact() {
  return (
    <section id="contact" className="py-20 bg-white/90 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Contactez-nous
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Venez nous rendre visite
          </h2>
          <p className="text-lg text-muted-foreground">
            Nous sommes là pour vous servir avec le sourire
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de contact</CardTitle>
                <CardDescription>Retrouvez-nous ou contactez-nous</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Adresse</p>
                    <p className="text-muted-foreground">183 Rue des Postes</p>
                    <p className="text-muted-foreground">59000 Lille, France</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Téléphone</p>
                    <a href="tel:+33320000000" className="text-primary hover:underline">
                      03 20 00 00 00
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Email</p>
                    <a href="mailto:contact@boucheriedunord.fr" className="text-primary hover:underline">
                      contact@boucheriedunord.fr
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Horaires d'ouverture</p>
                    <p className="text-muted-foreground">Tous les jours : 08:30 - 20:00</p>
                    <p className="text-muted-foreground text-sm mt-1">Retrait de commandes aux mêmes horaires</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary fill-primary" />
                  <CardTitle className="text-primary">Viande 100% Halal</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Toutes nos viandes sont certifiées Halal et proviennent de fournisseurs de confiance.
                  Qualité et fraîcheur garanties pour votre tranquillité d'esprit.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden p-0">
            <div className="h-[500px] lg:h-full min-h-[500px] bg-muted rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2530.5!2d3.063589!3d50.636565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c2d579b3256e11%3A0x40af13e81641160!2s183%20Rue%20des%20Postes%2C%2059000%20Lille!5e0!3m2!1sfr!2sfr!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
                title="Carte - 183 Rue des Postes, 59000 Lille"
              ></iframe>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
