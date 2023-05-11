import { render } from '@testing-library/vue'
import Login from '../src/pages/auth/login/Login.vue'

test('it should work', () => {
  const { getByText } = render(Login, {
    props: {
      /* ... */
    }
  })

  // assert output
  getByText('login')
})