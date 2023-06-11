/* eslint-disable */
import ldap from 'ldapjs';
import { PrismaClient } from '../../../node_modules/@prisma/client';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();
const rootDn = process.env.LDAP_ROOT_DN || 'dc=example, dc=com';
const ldapPort = parseInt(process.env.LDAP_PORT) || 389;

// Init ldap server and prisma client
const server = ldap.createServer();
const prisma = new PrismaClient();

// Code to handle LDAP requests

server.use(async (req, res, next) => {
  console.log('Request on', req.dn.toString() + ' with ' + req.scope + ' scope');
  return next();
});

server.bind(rootDn, async (req, res, next) => {
  try {
    // Anonymous bind
    console.log('anonymous bind request');
    res.end();
    return next();
  } catch (error) {
    console.error('Error handling bind request:', error);
    res.end(new ldap.OtherError(error.message));
    return next(error);
  }
});

server.search('', async (req, res, next) => {
  console.log('rootDSE ' + req.scope);
  try {
    const rootDSE = {
      configContext: 'cn=config', // Configuration context
      namingContexts: [rootDn], // Naming contexts
      objectclass: ['top', 'OpenLDAProotDSE'], // Object classes
      structuralObjectClass: 'OpenLDAProotDSE', // Structural object class
      subschemaSubentry: 'cn=Subschema', // Subschema subentry
      supportedControl: [
        '1.3.6.1.4.1.4203.1.10.1',
        '2.16.840.1.113730.3.4.18',
        '2.16.840.1.113730.3.4.2',
      ], // Supported controls
      supportedLDAPVersions: ['3'], // LDAP versions
      supportedSASLMechanisms: ['PLAIN', 'EXTERNAL'], // SASL mechanisms
    };
    if (
      req.scope === 'base' &&
      req.filter instanceof ldap.PresenceFilter &&
      req.filter.attribute === 'objectclass'
    ) {
      res.send({
        dn: rootDn,
        attributes: rootDSE,
      });
    }
    res.end();
    return next();
  } catch (error) {
    console.error('Error handling bind request:', error);
    res.end(new ldap.OtherError(error.message));
    return next(error);
  }
});

server.search('cn=Subschema', async (req, res, next) => {
  console.log('cn=Subschema');
  try {
    res.send({
      dn: 'cn=Subschema',
      attributes: {
        objectclass: ['top', 'subentry', 'subschema'],
        cn: 'Subschema',
      },
    });
    res.end();
    return next();
  } catch (error) {
    console.error('Error handling search request:', error);
    res.end(new ldap.OtherError(error.message));
    return next(error);
  }
});

server.search(`ou=people,${rootDn}`, async (req, res, next) => {
  console.log(`ou=people,${rootDn} ` + req.scope);
  const dc = req.dn.rdns[0].attrs.cn ? req.dn.rdns[0].attrs.cn.value : 'cn';
  try {
    // Search for one user
    if (dc !== 'cn' && req.filter instanceof ldap.PresenceFilter && req.scope === 'base') {
      const user = await prisma.user.findUnique({
        where: {
          uid: dc,
        },
      });
      if (user) {
        res.send({
          dn: `cn=${user.uid},ou=people,${rootDn}`,
          attributes: {
            cn: user.firstName + ' ' + user.lastName,
            displayName: user.firstName + ' ' + user.lastName,
            givenName: user.firstName,
            homeDirectory: '/home/' + user.uid,
            sn: user.lastName,
            uid: user.uid,
            mail: user.email,
            promo: user.graduationYear,
            objectclass: [
              'top',
              'person',
              'organizationalPerson',
              'inetOrgPerson',
              'posixAccount',
              'shadowAccount',
              'Eleve',
            ],
          },
        });
      }
      res.end();
    } else if (dc !== 'cn' && req.filter instanceof ldap.PresenceFilter && req.scope === 'one') {
      // End of the tree
      res.end();
    } else if (
      req.filter instanceof ldap.PresenceFilter &&
      req.filter.attribute === 'objectclass' &&
      req.scope === 'base'
    ) {
      res.send({
        dn: `ou=people,${rootDn}`,
        attributes: {
          objectclass: ['top', 'organizationalUnit'],
          ou: 'people',
        },
      });
      res.end();
    } else if (
      req.filter instanceof ldap.PresenceFilter &&
      req.filter.attribute === 'objectclass' &&
      req.scope === 'one'
    ) {
      const users = await prisma.user.findMany();
      const ldapUsers = users.map((user) => {
        return {
          dn: `cn=${user.uid},ou=people,${rootDn}`,
          attributes: {
            cn: user.firstName + ' ' + user.lastName,
            displayName: user.firstName + ' ' + user.lastName,
            givenName: user.firstName,
            homeDirectory: '/home/' + user.uid,
            sn: user.lastName,
            uid: user.uid,
            mail: user.email,
            promo: user.graduationYear,
            objectclass: [
              'top',
              'person',
              'organizationalPerson',
              'inetOrgPerson',
              'posixAccount',
              'shadowAccount',
              'Eleve',
            ],
          },
        };
      });
      for (const user of ldapUsers.values()) res.send(user);
      res.end();
    } else if (req.filter instanceof ldap.EqualityFilter && req.filter.attribute === 'uid') {
      const user = await prisma.user.findUnique({
        where: {
          uid: req.filter.value,
        },
      });
      if (user) {
        res.send({
          dn: `cn=${user.uid},ou=people,${rootDn}`,
          attributes: {
            cn: user.firstName + ' ' + user.lastName,
            displayName: user.firstName + ' ' + user.lastName,
            givenName: user.firstName,
            homeDirectory: '/home/' + user.uid,
            sn: user.lastName,
            uid: user.uid,
            mail: user.email,
            promo: user.graduationYear,
            objectclass: [
              'top',
              'person',
              'organizationalPerson',
              'inetOrgPerson',
              'posixAccount',
              'shadowAccount',
              'Eleve',
            ],
          },
        });
      }
      res.end();
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Error handling search request:', error);
    res.end(new ldap.OtherError(error.message));
    return next(error);
  }
});

server.search(`ou=ecoles,ou=groups,${rootDn}`, async (req, res, next) => {
  console.log(`ou=ecoles,ou=clubs,${rootDn} ` + req.scope);
  try {
    if (req.filter instanceof ldap.PresenceFilter && req.scope === 'base') {
      res.send({
        dn: `ou=ecoles,ou=groups,${rootDn}`,
        attributes: {
          objectclass: ['top', 'organizationalUnit'],
          ou: 'ecoles',
        },
      });
      res.end();
    } else {
      const ecoles = await prisma.school.findMany({
        include: {
          majors: {
            include: {
              students: true,
            },
          },
        },
      });
      const ldapEcoles = ecoles.map((ecole) => {
        return {
          dn: `cn=${ecole.name},ou=ecoles,ou=groups,${rootDn}`,
          attributes: {
            cn: ecole.name,
            displayName: ecole.name,
            objectclass: ['top', 'groupOfNames'],
            member: ecole.majors.map((major) => {
              major.students.map((student) => {
                return `cn=${student.uid},ou=people,${rootDn}`;
              });
            }),
          },
        };
      });
      for (const ecole of ldapEcoles.values()) res.send(ecole);
      res.end();
    }
  } catch (error) {
    console.error('Error handling search request:', error);
    res.end(new ldap.OtherError(error.message));
    return next(error);
  }
});

server.search(`ou=aes,ou=groups,${rootDn}`, async (req, res, next) => {
  console.log(`ou=aes,ou=groups,${rootDn} ` + req.scope);
  try {
    if (req.filter instanceof ldap.PresenceFilter && req.scope === 'base') {
      res.send({
        dn: `ou=ae,ou=groups,${rootDn}`,
        attributes: {
          objectclass: ['top', 'organizationalUnit'],
          ou: 'ae',
        },
      });
      res.end();
    } else {
      const aes = await prisma.group.findMany({
        where: {
          type: 'StudentAssociationSection',
        },
        include: {
          members: true,
        },
      });
      const ldapAes = aes.map((ae) => {
        return {
          dn: `cn=${ae.name},ou=aes,ou=groups,${rootDn}`,
          attributes: {
            cn: ae.name,
            displayName: ae.name,
            description: ae.description,
            objectclass: ['top', 'groupOfNames'],
            memberUid: ae.members.map((member) => member.memberId),
          },
        };
      });
      for (const ae of ldapAes.values()) res.send(ae);
      res.end();
    }
  } catch (error) {
    console.error('Error handling search request:', error);
    res.end(new ldap.OtherError(error.message));
    return next(error);
  }
});

server.search(`ou=clubs,ou=groups,${rootDn}`, async (req, res, next) => {
  console.log(`ou=groups,ou=clubs,${rootDn} ` + req.scope);
  try {
    if (req.filter instanceof ldap.PresenceFilter && req.scope === 'base') {
      res.send({
        dn: `ou=groups,ou=groups,${rootDn}`,
        attributes: {
          objectclass: ['top', 'organizationalUnit'],
          ou: 'clubs',
        },
      });
      res.end();
    } else {
      const clubs = await prisma.group.findMany({
        where: {
          type: 'Club' || 'Association',
        },
        include: {
          members: true,
        },
      });
      const ldapClubs = clubs.map((club) => {
        return {
          dn: `cn=${club.name},ou=clubs,ou=groups,${rootDn}`,
          attributes: {
            cn: club.name,
            displayName: club.name,
            description: club.description,
            objectclass: ['top', 'groupOfNames'],
            memberUid: club.members.map((member) => member.memberId),
          },
        };
      });
      for (const club of ldapClubs.values()) res.send(club);
      res.end();
    }
  } catch (error) {
    console.error('Error handling search request:', error);
    res.end(new ldap.OtherError(error.message));
    return next(error);
  }
});

server.search(`ou=grp-informels,ou=groups,${rootDn}`, async (req, res, next) => {
  console.log(`ou=grp-informels,ou=clubs,${rootDn} ` + req.scope);
  try {
    if (req.filter instanceof ldap.PresenceFilter && req.scope === 'base') {
      res.send({
        dn: `ou=grp-informels,ou=groups,${rootDn}`,
        attributes: {
          objectclass: ['top', 'organizationalUnit'],
          ou: 'grp-informels',
        },
      });
      res.end();
    } else {
      const grp_informels = await prisma.group.findMany({
        where: {
          type: 'Group',
        },
        include: {
          members: true,
        },
      });
      const ldapGrpInformels = grp_informels.map((grp_informel) => {
        return {
          dn: `cn=${grp_informel.name},ou=grp-informels,ou=groups,${rootDn}`,
          attributes: {
            cn: grp_informel.name,
            displayName: grp_informel.name,
            description: grp_informel.description,
            objectclass: ['top', 'groupOfNames'],
            memberUid: grp_informel.members.map((member) => member.memberId),
          },
        };
      });
      for (const grp_informel of ldapGrpInformels.values()) res.send(grp_informel);
      res.end();
    }
  } catch (error) {
    console.error('Error handling search request:', error);
    res.end(new ldap.OtherError(error.message));
    return next(error);
  }
});

server.search(`ou=groups,${rootDn}`, async (req, res, next) => {
  console.log(`ou=groups,${rootDn} ` + req.scope);
  try {
    if (req.filter instanceof ldap.PresenceFilter && req.scope === 'base') {
      res.send({
        dn: `ou=groups,${rootDn}`,
        attributes: {
          objectclass: ['top', 'organizationalUnit'],
          ou: 'groups',
        },
      });
      res.end();
    } else {
      res.send({
        dn: `ou=clubs,ou=groups,${rootDn}`,
        attributes: {
          objectclass: ['top', 'organizationalUnit'],
          ou: 'clubs',
        },
      });
      res.send({
        dn: `ou=ecoles,ou=groups,${rootDn}`,
        attributes: {
          objectclass: ['top', 'organizationalUnit'],
          ou: 'ecoles',
        },
      });
      res.send({
        dn: `ou=aes,ou=groups,${rootDn}`,
        attributes: {
          objectclass: ['top', 'organizationalUnit'],
          ou: 'ae',
        },
      });
      res.send({
        dn: `ou=grp-informels,ou=groups,${rootDn}`,
        attributes: {
          objectclass: ['top', 'organizationalUnit'],
          ou: 'grp-informels',
        },
      });
      res.end();
    }
  } catch (error) {
    console.error('Error handling search request:', error);
    res.end(new ldap.OtherError(error.message));
    return next(error);
  }
});

server.search(rootDn, async (req, res, next) => {
  console.log(rootDn + ' ' + req.scope);
  try {
    if (
      req.filter instanceof ldap.PresenceFilter &&
      req.filter.attribute === 'objectclass' &&
      req.scope === 'base'
    ) {
      console.log('search request for rootDn');
      res.send({
        dn: rootDn,
        attributes: {
          objectclass: ['top', 'dcObject', 'organization'],
          o: 'inp-net',
          dc: 'etu-inpt',
        },
      });
      res.end();
      return next();
    } else {
      res.send({
        dn: `ou=people,${rootDn}`,
        attributes: {
          objectclass: ['top', 'organizationalUnit'],
          ou: 'people',
        },
      });
      res.send({
        dn: `ou=groups,${rootDn}`,
        attributes: {
          objectclass: ['top', 'organizationalUnit'],
          ou: 'groups',
        },
      });
      res.end();
      return next();
    }
  } catch (error) {
    console.error('Error handling search request:', error);
    res.end(new ldap.OtherError(error.message));
    return next(error);
  }
});

server.unbind(async (req, res, next) => {
  // Handle unbind request
  // Clean up any resources if necessary
  res.end();
  return next();
});

// Add more handlers as needed

server.listen(ldapPort, () => {
  console.log('LDAP server listening on %s', server.url);
});
