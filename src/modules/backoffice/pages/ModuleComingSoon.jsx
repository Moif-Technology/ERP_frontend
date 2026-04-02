import { useNavigate } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import { getSoftwareModule, setSoftwareModule } from '../../../core/auth/auth.service.js';
import {
  SOFTWARE_MODULE_IDS,
  SOFTWARE_MODULE_OPTIONS,
} from '../../../core/config/softwareModules.js';

export default function ModuleComingSoon() {
  const navigate = useNavigate();
  const id = getSoftwareModule();
  const opt = SOFTWARE_MODULE_OPTIONS.find((o) => o.value === id);
  const title = opt?.label ?? 'This module';

  const openBackOffice = () => {
    setSoftwareModule(SOFTWARE_MODULE_IDS.backoffice);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div
      className="mx-auto max-w-lg rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm"
      style={{ marginTop: 24 }}
    >
      <h1 className="text-xl font-semibold" style={{ color: colors.primary?.main ?? '#800000' }}>
        {title}
      </h1>
      <p className="mt-3 text-sm text-gray-600">
        This module&apos;s screens are not available yet. You signed in with this software type for
        when it is ready.
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Continue working in <strong>Back office</strong>, which is available now.
      </p>
      <button
        type="button"
        onClick={openBackOffice}
        className="mt-8 inline-block rounded-md bg-[#800000] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#6a0000]"
      >
        Open back office
      </button>
    </div>
  );
}
