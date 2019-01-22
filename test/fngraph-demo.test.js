var R = require('ramda');
const {fngraph} = require('../src/index');
const Handlebars = require('handlebars');

const waitOnValue = R.curry((msec, value) =>
  new Promise(
    (resolve, _reject) => setTimeout(() => resolve(value), msec)
  )
);

const db = {
  accounts: {
    1001: {
      first: 'John',
      last: 'Doe',
      emailAddress: 'johndoe@acme.com'
    }
  },
  products: {
    42: {
      name: 'Widget',
      plural: 'Widgets',
      unitPrice: 99.99
    }
  }
};

const newYearsPromo = {
  fromAddress: 'sales@marketeers.com',
  subjectTemplate: 'Big Savings on {{product.plural}} in January',
  bodyTemplate: 'Hi {{acct.first}}, Check out the huge savings on {{product.plural}} this month.'
};

const getAccount = R.curry((db, id) => db.accounts[id]);
const getProduct = R.curry((db, id) => db.products[id]);
const makeEmailSubject = (campaign, product) => {
  const template = Handlebars.compile(campaign.subjectTemplate);
  const data = {campaign, product};
  return template(data);
};
const makeEmailBody = (campaign, product, acct) => {
  const template = Handlebars.compile(campaign.bodyTemplate);
  const data = {campaign, product, acct};
  return template(data);
};
const assembleEmail = (to, from, subject, body) => {
  return {to, from, subject, body};
};

const graph = {
  'db': 0,
  'acctId': 1,
  'productId': 2,
  'campaign': 3,
  'acct': [getAccount, 'db', 'acctId'],
  'to': [R.prop('emailAddress'), 'acct'],
  'from': [R.prop('fromAddress'), 'campaign'],
  'product': [getProduct, 'db', 'productId'],
  'subject': [makeEmailSubject, 'campaign', 'product'],
  'body': [makeEmailBody, 'campaign', 'product', 'acct'],
  'RETURN': [assembleEmail, 'to', 'from', 'subject', 'body']
};

const expected = {
  to: 'johndoe@acme.com',
  from: 'sales@marketeers.com',
  subject: 'Big Savings on Widgets in January',
  body: 'Hi John, Check out the huge savings on Widgets this month.'
};

describe('fngraph demo test', () => {
  test("fngraph demo test sync", () => {
    const makeProductCampaignEmail = fngraph(graph);
    return makeProductCampaignEmail(db, 1001, 42, newYearsPromo)
    .then(res => {
      console.log(res);
      expect(res).toEqual(expected);
    });
  });
});
