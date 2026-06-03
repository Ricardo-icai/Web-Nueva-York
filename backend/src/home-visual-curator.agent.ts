import { Injectable } from '@nestjs/common';

@Injectable()
export class HomeVisualCuratorAgent {
  getHomeVisualAudit() {
    return {
      agent: 'HomeVisualCuratorAgent',
      generatedAt: new Date().toISOString(),
      principle:
        'Each home card must be visually literal: the user should understand the section before reading the label.',
      selections: [
        {
          section: 'Transporte publico',
          image: 'NYC subway train at station',
          rationale: 'A real New York subway platform communicates metro and public transit instantly.',
        },
        {
          section: 'Tengo Hambre',
          image: 'Close-up pizza table photography',
          rationale: 'A clear pizza image reads instantly as food and avoids a weak or unclear restaurant visual.',
        },
        {
          section: 'Roof Tops',
          image: 'SUMMIT One Vanderbilt observation deck view',
          rationale: 'A real observation deck image is more accurate than a generic skyline.',
        },
        {
          section: '4 de Julio',
          image: 'Fireworks around Freedom Tower',
          rationale: 'Fireworks over a New York landmark clearly signals Independence Day in NYC.',
        },
        {
          section: 'Cultura',
          image: 'Statue of Liberty',
          rationale: 'The Statue of Liberty is one of the strongest cultural and historic icons of New York.',
        },
        {
          section: 'Editar perfil',
          image: 'Times Square at night',
          rationale: 'The travel profile card represents the trip setup rather than a content category.',
        },
      ],
      checks: [
        'No generic stock food for the restaurants card.',
        'No generic cityscape for public transit.',
        'No irrelevant rooftop hotel imagery for viewpoints.',
        '4 de Julio card uses NYC fireworks imagery.',
        'Cultura card uses a clear New York cultural landmark.',
      ],
    };
  }
}
