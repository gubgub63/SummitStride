'use client';

import React from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, StatsCard, CourseCard, Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '../components/ui';
import { ThemeProvider, ThemeToggle } from '../lib/theme';

function DesignSystemDemo() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedCourse, setSelectedCourse] = React.useState<string | null>(null);

  const mockCourse = {
    id: '1',
    name: 'Ultra Trail du Mont-Blanc',
    location: 'Chamonix, France',
    distance: 171,
    elevationGain: 9600,
    difficulty: 'HARD',
    description: 'La course mythique autour du Mont-Blanc, un défi exceptionnel au cœur des Alpes.'
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-alpine rounded-md"></div>
            <h1 className="text-xl font-bold text-gradient-alpine">Coach IA Hugo</h1>
          </div>
          <ThemeToggle/>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-gradient-alpine">
            Alpine Tech Design System
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Système de design moderne pour l&apos;entraînement ultra-trail.
            Découvrez notre identité visuelle innovante alliant nature et technologie.
          </p>
        </section>

        {/* Color Palette */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Palette Alpine Tech</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 bg-primary-600 rounded-lg"></div>
              <p className="text-sm font-medium">Bleu Glacier</p>
              <p className="text-xs text-muted-foreground">#2563eb</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-secondary-600 rounded-lg"></div>
              <p className="text-sm font-medium">Orange Ultra</p>
              <p className="text-xs text-muted-foreground">#ff6b35</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-success-500 rounded-lg"></div>
              <p className="text-sm font-medium">Vert Montagne</p>
              <p className="text-xs text-muted-foreground">#10b981</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-neutral-500 rounded-lg"></div>
              <p className="text-sm font-medium">Gris Schiste</p>
              <p className="text-xs text-muted-foreground">#64748b</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Typographie Performance</h2>
          <div className="space-y-4">
            <div>
              <h1 className="text-5xl font-bold">Titre Principal H1</h1>
              <p className="text-sm text-muted-foreground">Inter Variable, 48px, Bold</p>
            </div>
            <div>
              <h2 className="text-3xl font-semibold">Titre Secondaire H2</h2>
              <p className="text-sm text-muted-foreground">Inter Variable, 30px, Semibold</p>
            </div>
            <div>
              <p className="text-base">
                Corps de texte principal. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <p className="text-sm text-muted-foreground">Inter Variable, 16px, Normal</p>
            </div>
            <div>
              <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                font-family: &apos;JetBrains Mono Variable&apos;
              </code>
              <p className="text-sm text-muted-foreground">JetBrains Mono Variable pour le code</p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Boutons</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Button variant="default">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="gradient">Gradient</Button>
            <Button variant="link">Link</Button>
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button loading>Loading</Button>
          </div>
        </section>

        {/* Inputs */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Inputs</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
            <Input
              label="Email"
              placeholder="votre@email.com"
              type="email"
              helperText="Votre adresse email sera sécurisée"
            />
            <Input
              label="Mot de passe"
              placeholder="••••••••"
              type="password"
              isRequired
            />
            <Input
              label="Distance"
              placeholder="42"
              variant="success"
              rightIcon={
                <span className="text-xs">km</span>
              }
            />
            <Input
              label="Erreur"
              placeholder="Valeur incorrecte"
              variant="error"
              errorMessage="Cette valeur est requise"
            />
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Cards</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Standard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Contenu de la carte avec du texte descriptif.
                </p>
              </CardContent>
            </Card>

            <StatsCard
              title="Distance Totale"
              value="1,247 km"
              subtitle="Cette année"
              trend={{ value: 12, isPositive: true }}
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />

            <CourseCard
              course={mockCourse}
              onSelect={setSelectedCourse}
              isSelected={selectedCourse === mockCourse.id}
            />
          </div>
        </section>

        {/* Action Buttons */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Interactions</h2>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="gradient"
              size="lg"
              onClick={() => setModalOpen(true)}
            >
              Ouvrir Modal
            </Button>
            <Button
              variant="outline-primary"
              rightIcon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              }
            >
              Découvrir Plus
            </Button>
          </div>
        </section>
      </main>

      {/* Demo Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalContent size="lg">
          <ModalHeader>
            <ModalTitle>Modal de Démonstration</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p>
                Ceci est une démonstration du composant Modal avec le design system Alpine Tech.
              </p>
              <Input
                label="Nom de la course"
                placeholder="Ex: Trail des Crêtes"
                helperText="Entrez le nom de votre prochaine course"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Distance (km)"
                  placeholder="42"
                  type="number"
                />
                <Input
                  label="Dénivelé (m)"
                  placeholder="2000"
                  type="number"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="gradient" onClick={() => setModalOpen(false)}>
              Enregistrer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Footer */}
      <footer className="border-t border-border bg-surface mt-12">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">
            Coach IA Hugo - Design System Alpine Tech 2025
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider defaultTheme="system">
      <DesignSystemDemo />
    </ThemeProvider>
  );
}
