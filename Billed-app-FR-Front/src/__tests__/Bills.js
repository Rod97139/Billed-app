/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import { fireEvent } from "@testing-library/dom";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";


jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
       expect(windowIcon.className).toBe('active-icon')
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe("When I am on the Bill page and I click on the eye icon of a bill", () => {
    test("Then, it should display the bill modal", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({data : [bills[0]]})
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const billsContainer = new Bills({document, onNavigate, localStorage: window.localStorage, store: null})
      $.fn.modal = jest.fn()
      const handleClickIconEye = jest.fn(() => { billsContainer.handleClickIconEye })
      const eyeIcon = screen.getByTestId('icon-eye')
      eyeIcon.addEventListener('click', handleClickIconEye)
      fireEvent.click(eyeIcon)
      expect(handleClickIconEye).toHaveBeenCalled()
      const modale = screen.getByTestId('modaleFile')
      expect(modale).toBeTruthy()
    })
  })
  describe("When I click on the new bill button", () => {
    test("Then the new bill page should be displaied", ()=> {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({data : [bills[0]]})
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const billsContainer = new Bills({document, onNavigate, localStorage: window.localStorage, store: null})
      const newBillBtn = screen.getByTestId('btn-new-bill')
      const handleClickNewBill = jest.fn(billsContainer.handleClickNewBill)
      newBillBtn.addEventListener('click', handleClickNewBill)

      fireEvent.click(newBillBtn)
      const newBillPage = screen.getByTestId('content-title')
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(newBillPage).toBeTruthy()
    })
  })
})
