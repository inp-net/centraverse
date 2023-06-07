export function durationDisplay(seconds: number) {
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 31;
  const year = month * 12;
  const century = year * 100;
  let displayString = '';
  let base = 0;
  if (seconds < 1) {
    displayString = "moins d'une seconde";
  } else if (seconds < minute) {
    base = Math.round(seconds);
    displayString = `${base} ${base === 1 ? 'seconde' : 'secondes'}`;
  } else if (seconds < hour) {
    base = Math.round(seconds / minute);
    displayString = `${base} ${base === 1 ? 'minute' : 'minutes'}`;
  } else if (seconds < day) {
    base = Math.round(seconds / hour);
    displayString = `${base} ${base === 1 ? 'heure' : 'heures'}`;
  } else if (seconds < week) {
    base = Math.round(seconds / day);
    displayString = `${base} ${base === 1 ? 'jour' : 'jours'}`;
  } else if (seconds < month) {
    base = Math.round(seconds / week);
    displayString = `${base} ${base === 1 ? 'semaine' : 'semaines'}`;
  } else if (seconds < year) {
    base = Math.round(seconds / month);
    displayString = `${base} mois`;
  } else if (seconds < century) {
    base = Math.round(seconds / year);
    displayString = `${base} ${base === 1 ? 'an' : 'ans'}`;
  } else {
    displayString = 'des siècles';
  }

  return displayString;
}

export function isToday(date: Date): boolean {
  return (
    date.getFullYear() === new Date().getFullYear() &&
    date.getMonth() === new Date().getMonth() &&
    date.getDate() === new Date().getDate()
  );
}

export async function getDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      resolve(reader.result as string);
    });
    reader.addEventListener('error', (e) => {
      reject(e);
    });
    reader.readAsDataURL(file);
  });
}

export function lowerFirstChar(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/** Remove indentation from a string */
export function dedent(value: string): string {
  const match = value.match(/^[\t ]*(?=\S)/gm);
  if (match === null) return value;
  const indent = Math.min(...match.map((el) => el.length));
  const regexp = new RegExp(`^[ \\t]{${indent}}`, 'gm');
  return value.replace(regexp, '');
}

export function titleCase(str: string): string {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function sentenceJoin(items: string[]): string {
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(', ') + ' et ' + items[items.length - 1];
}

export function clamp(value: number, min: number, max: number): number {
  if (value <= min) return min;
  if (value >= max) return max;
  return value;
}
