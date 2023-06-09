export const DISPLAY_PAYMENT_METHODS = {
  Cash: 'Espèces',
  Check: 'Chèque',
  Card: 'Carte bancaire',
  Transfer: 'Virement',
  Lydia: 'Lydia',
  Other: 'Autre',
};

export const DISPLAY_VISIBILITIES = {
  Public: 'Public',
  Restricted: 'Restreint au groupe',
  Unlisted: 'Non répertorié',
  Private: 'Privé',
};

export const HELP_VISIBILITY = {
  Public: 'Visible par tous',
  Restricted: 'Visible par les membres du groupe',
  Unlisted: 'Visible par tout ceux qui possèdent le lien',
  Private: 'Visible par personne (excepté les administrateurs et organisateurs)',
};

export const DISPLAY_NOTIFICATION_TYPES = {
  NewArticle: 'Nouvel article',
  ShotgunOpeningSoon: "Ouverture imminente d'un shotgun",
  ShotgunOpened: "Ouverture d'un shotgun",
  ShotgunClosingSoon: "Fermeture imminente d'un shotgun",
  ShotgunClosed: "Fermeture d'un shotgun",
  GodsonRequestReceived: 'Réception de demandes de parrainage',
  GodsonRequestAccepted: 'Approbation de demandes de parrainage',
  GodsonRequestRefused: 'Refus de demandes de parrainage',
  PermissionsChanged: 'Modification de mes permissions',
  Other: 'Autres',
};

export const ORDER_NOTIFICATION_TYPES: Array<keyof typeof DISPLAY_NOTIFICATION_TYPES> = [
  'NewArticle',
  'ShotgunOpeningSoon',
  'ShotgunOpened',
  'ShotgunClosingSoon',
  'ShotgunClosed',
  'GodsonRequestReceived',
  'GodsonRequestAccepted',
  'GodsonRequestRefused',
  'PermissionsChanged',
];
