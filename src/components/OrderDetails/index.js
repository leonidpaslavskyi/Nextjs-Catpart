import React, { useEffect, useState } from 'react'
import Ripples from 'react-ripples'

import dateFormatter from '../../utils/dateFormatter'
import priceFormatter from '../../utils/priceFormatter'
import apiGET from '../../utils/search'
import DetailsRow from '../DetailsRow'

import { RUB } from '@/store/constants'
import { API } from '@/utils/order'
import { validateEmail } from '@/utils/validateEmail'
import { xlsDownload } from '@/utils/xlsDownload'

const OrderDetails = (props) => {
  const { detailsId, devMode, profile, order, notificationFunc } = props

  const authRef = React.createRef()
  const phoneInput = React.createRef()
  const commentInput = React.createRef()
  const contactInput = React.createRef()
  const emailInput = React.createRef()

  const [currentOrder, setCurrentOrder] = useState({})

  const [fields, setFields] = useState({
    'details-inn': '',
    'details-account': '',
    'details-bik': '',
    'details-address': '',
    'details-contact': '',
    'details-phone': '',
    'details-email': '',
  })
  const [errors, setErrors] = useState({
    'details-inn': null,
    'details-account': null,
    'details-bik': null,
    'details-address': null,
    'details-contact': null,
    'details-phone': null,
    'details-email': null,
  })

  const [validForm, setValidForm] = useState(false)
  const [justRedraw, setJustRedraw] = useState(0)

  const changeSubmit = (e) => {
    e.preventDefault()

    devMode && console.log('changeSubmit')

    // const url = '/set/deal';
    //
    // let store = localStorage.getItem('catpart');
    //
    // if (store) {
    //  store = JSON.parse(store);
    // } else {
    //  store = {};
    // }
    //
    // if (!store.hasOwnProperty('order')) {
    //  store.order = [];
    //  localStorage.setItem('catpart', JSON.stringify(store));
    // }
  }

  const handleChange = (field, e) => {
    devMode && console.log('handleChange', field, e)
    fields[field] = e.target.value
    setFields(fields)

    switch (field) {
      case 'details-bik':
      case 'details-inn':
      case 'details-address':
      case 'details-contact':
        errors[field] = e.target.value.length ? '' : '???? ?????????? ???????? ????????????'
        break
      case 'details-account':
        errors[field] = e.target.value.length >= 8 ? '' : '?????????????? 8 ????????????????'
        break
      case 'details-phone':
        errors[field] = e.target.value.length >= 8 ? '' : '?????????????? 8 ????????????????'
        break
      case 'details-email':
        errors[field] = e.target.value.length && validateEmail(e.target.value) ? '' : '?????????????????? ???????????? e-mail'
        break
    }

    // localStorage.setItem('catpart-user', JSON.stringify(fields));

    setErrors(errors)

    setValidForm(!Object.values(errors).filter((er) => er === null || er.length).length)

    setJustRedraw(justRedraw + 1)
  }

  const tableHeader = {
    name: '????????????????????',
    supplier: '??????????????????',
    manufacturer: '??????????',
    quantity: '??????-????',
    price: '????????\n???? ????.',
    sum: '??????????',
    statuses: '????????????', // todo best times
    calculated_delivery_date: '?????????????????? ????????',
    real_delivery_date: '???????? ????????????????',
    comment: '?????????????????????? ??????????????????',
  }

  const tHead = (
    <div className="details-results__row __even __head">
      {Object.keys(tableHeader).map((head, hi) =>
        ['real_delivery_date', 'manufacturer', 'supplier'].indexOf(head) > -1 ? null : (
          <div key={hi} className={`details-results__cell __${head}`}>
            {head === 'statuses'
              ? null
              : head === 'calculated_delivery_date'
              ? `${tableHeader[head]}/\n${tableHeader.real_delivery_date}`
              : tableHeader[head]}
          </div>
        )
      )}
    </div>
  )

  useEffect(() => {
    // setInputFilter(phoneInput.current, function(value) {
    //  return /^\+?\d*$/.test(value); // Allow digits and '+' on beginning only, using a RegExp
    // });

    //const requestURL = `/orders/${detailsId}`
    //
    //apiGET(requestURL, {}, (data) => {
    //  devMode && console.log('OrderDetails', detailsId, data)
    //})

    return () => {
      phoneInput.current = false
    }
  }, [])

  const healthGradient = (percent) => {
    const start = Math.min(96, Math.max(0, percent - 2))

    return (
      <span
        style={{
          backgroundImage: `linear-gradient(to right, rgb(190, 243, 49) ${start}%, rgb(220, 247, 150) ${
            start + 4
          }%,  rgb(250, 250, 250) 100%)`,
        }}
        className="orders-health__bar"
      >
        <span>{percent}%</span>
      </span>
    )
  }

  return order?.id ? (
    <div className="profile __details">
      <div className="aside-title">{`${order.title || <span data-empty="title" />} ???? ${
        order.created_at ? dateFormatter(order.created_at) : ''
      }`}</div>

      <div className="orders-details">
        <div className="orders-details__left">
          <ul className="orders-health__list">
            <li>
              <span>????????????????</span>
              {healthGradient(
                parseInt(order.statuses && order.statuses.hasOwnProperty('pay') ? order.statuses.pay : 0)
              )}
            </li>
            <li>
              <span>???? ????????????</span>
              {healthGradient(
                parseInt(order.statuses && order.statuses.hasOwnProperty('stock') ? order.statuses.stock : 0)
              )}
            </li>
            <li>
              <span>??????????????????</span>
              {healthGradient(
                parseInt(order.statuses && order.statuses.hasOwnProperty('ship') ? order.statuses.ship : 0)
              )}
            </li>
          </ul>

          <ul className="orders-info">
            <li>
              <span>????????????????:&nbsp;</span>
              <b>{`${order.requisites.company_name ? `${order.requisites.company_name}, ` : ''}?????? ${
                order.requisites.inn || <span data-empty="inn" />
              }`}</b>
            </li>
            {/* todo best times */}
            {/*     <li>
              <span>??????????????:&nbsp;</span> <b>{order.requisites.contact_name || order.contact_name || <span data-empty="requisites" />}</b>
            </li>
            <li>
              <span>????????????????:&nbsp;</span> <b>{order.delivery_type || <span data-empty="delivery_type">?????? ???? ??????????????????</span>}</b>
            </li>*/}
            <li>
              <span>?????????? ????????????????:&nbsp;</span>{' '}
              <b>{order.requisites.address || <span data-empty="address">?????? ???? ????????????????</span>}</b>
            </li>
            <li>
              <span>???????????????????? ????????????:&nbsp;</span> <b>{order.contact_name || ''}</b>
            </li>

            {order.hasOwnProperty('documents') && order.documents.length ? (
              <li>
                <span>??????????????????:&nbsp;</span>
                <span>
                  {order.documents.map((d, di) => (
                    <React.Fragment key={di}>
                      {di ? <>,&nbsp;</> : null}
                      <a
                        href={`${API}/order/documents/${d.id}?token=${localStorage.getItem('access_token')}` || ''}
                        className="document-link"
                      >
                        {d.title}
                      </a>
                    </React.Fragment>
                  ))}
                </span>
              </li>
            ) : null}
          </ul>
        </div>

        <div className="orders-details__right">
          <div className="profile-info">
            <ul>
              <li>
                <span>?????????? (RUB)&nbsp;</span>: <b>{priceFormatter(order.amount, 2)}</b>
              </li>
              {/* <li> */}
              {/*  <span>?????? (RUB)&nbsp;</span>: <b>{priceFormatter(order.amount * 0.2, 2)}</b> */}
              {/* </li> */}
              <li>
                <span>?????????????? (RUB)&nbsp;</span>: <b>{priceFormatter(order.amount - order.payed, 2)}</b>
              </li>
            </ul>
          </div>

          <div className="orders-chronology__scroller">
            {order.chronology && order.chronology.length ? (
              <ul className="orders-chronology__list">
                {order.chronology.reverse().map((c, ci) => (
                  <li key={ci} className={ci % 2 ? '__even' : '__odd'}>
                    {c.datetime ? <span className="orders-chronology__date">{dateFormatter(c.datetime)}</span> : null}
                    <span>{c.name}</span>
                    {c.file ? (
                      <a className="orders-chronology__link __green" href={c.file}>
                        xlsx
                      </a>
                    ) : null}
                  </li>
                ))}

                {/* <li className={'__odd'}> */}
                {/*  <span>25.05.2021 ??? ?????????????????? 20%</span> */}
                {/*  <a className={'orders-chronology__link __green'} href="#"> */}
                {/*    ?????? xlsx */}
                {/*  </a> */}
                {/* </li> */}
                {/* <li className={'__even'}> */}
                {/*  <span>25.05.2021 ??? ???? ???????????? 10%</span> */}
                {/* </li> */}
                {/* <li className={'__odd'}> */}
                {/*  <span>07.06.2021 ??? ?????????? ??????????????</span> */}
                {/* </li> */}
                {/* <li className={'__even'}> */}
                {/*  <span>26.05.2021 ??? ???????????????? 30%</span> */}
                {/* </li> */}
                {/* <li className={'__odd'}> */}
                {/*  <span>25.05.2021 ??? ???????? ??????????????????</span> */}
                {/*  <a className={'orders-chronology__link __green'} href="#"> */}
                {/*    xlsx */}
                {/*  </a> */}
                {/*  <a className={'orders-chronology__link __red'} href="#"> */}
                {/*    pdf */}
                {/*  </a> */}
                {/* </li> */}
              </ul>
            ) : null}
          </div>
        </div>
      </div>

      <div className="aside-order">
        <div className="form-filter__controls">
          <div className="form-filter__controls_left">
            <div className="form-filter__control">
              <Ripples
                onClick={() => {
                  if (order.products && order.products.length) {
                    xlsDownload([...order.products], RUB, 2)
                  } else {
                    notificationFunc('success', '?????????????? ??????????.', '???????????? ??????????????????.')
                  }
                }}
                className="btn __gray"
                during={1000}
              >
                <div className="btn-inner">
                  <span className="btn __blue">
                    <span className="btn-icon icon icon-download" />
                  </span>
                  <span>?????????????? ???????????? ?? ????????????</span>
                </div>
              </Ripples>
            </div>
          </div>
        </div>

        <div className="search-results">
          <div className="search-results__table">
            <div className="search-results__head-wrapper">{tHead}</div>
            {order.products && order.products.length
              ? order.products.map((row, ri) => (
                  <DetailsRow
                    key={ri}
                    devMode={devMode}
                    tableHeader={tableHeader}
                    currency={RUB}
                    notificationFunc={notificationFunc}
                    row={row}
                    rowIndex={ri}
                  />
                ))
              : null}
          </div>
        </div>
      </div>

      <div className="aside-caption">?????? ????????????????</div>

      <div className="profile-info">
        <ul>
          <li>{profile.responsible_name}</li>
          <li>{profile.responsible_phone}</li>
          <li>{profile.responsible_email}</li>
        </ul>
      </div>

      {/* <div className="aside-caption __mb-18">?????????? ?????????????????? ?????????????????? ?????????????????? ???? ???????? ?????????????</div> */}

      {/* <form ref={authRef} className="form-content" onSubmit={changeSubmit}> */}
      {/*  <FormInput */}
      {/*    onChange={handleChange.bind(this, 'details-email')} */}
      {/*    placeholder="?????? email" */}
      {/*    name="details-email" */}
      {/*    // */}
      {/*    error={errors['details-email']} */}
      {/*    className="__lg" */}
      {/*    inputRef={emailInput} */}
      {/*  /> */}

      {/*  <FormInput */}
      {/*    onChange={handleChange.bind(this, 'details-contact')} */}
      {/*    placeholder="??????" */}
      {/*    name="details-contact" */}
      {/*    // */}
      {/*    error={errors['details-contact']} */}
      {/*    className="__lg" */}
      {/*    inputRef={contactInput} */}
      {/*  /> */}

      {/*  <FormInput */}
      {/*    onChange={handleChange.bind(this, 'details-phone')} */}
      {/*    placeholder="??????????????" */}
      {/*    name="details-phone" */}
      {/*    // */}
      {/*    error={errors['details-phone']} */}
      {/*    className="__lg" */}
      {/*    inputRef={phoneInput} */}
      {/*  /> */}

      {/*  <FormInput textarea placeholder="?????? ????????????, ?????????????????? ?????? ???????????? ?????????????????? ??????????????????" name="details-delivery" error={null} className="__lg" inputRef={commentInput} /> */}

      {/*  <div className="form-control"> */}
      {/*    <Ripples className={`__w-100p btn __blue __lg${!validForm ? ' __disabled' : ''}`} during={1000}> */}
      {/*      <button name="details-submit" className="btn-inner"> */}
      {/*        <span>??????????????????</span> */}
      {/*      </button> */}
      {/*    </Ripples> */}
      {/*  </div> */}
      {/* </form> */}
    </div>
  ) : null
}
export default OrderDetails
