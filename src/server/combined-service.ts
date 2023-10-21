import {
  Service,
  ServiceOptions,
  ServiceConfiguration,
  DEFAULT_SERVICE_CONFIGURATION,
  Contact,
  License,
  Server,
} from "./service";

export interface CombinedServiceConfiguration extends ServiceConfiguration {
  title?: string;
  description?: string;
  tags?: string[];
  version?: string;
  contact?: Contact;
  license?: License;
  servers?: Server[];
}

export interface CombinedServiceOptions<TExtend = Record<string, never>>
  extends ServiceOptions<TExtend> {
  children: Service<TExtend>[];
}

export const DEFAULT_COMBINED_SERVICE_CONFIGURATION = {
  ...DEFAULT_SERVICE_CONFIGURATION,
  title: "",
  description: "",
  tags: [] as string[],
  contact: {
    name: "",
    email: "",
    url: "",
  },
  license: {
    name: "",
    url: "",
  },
} as const;

export function isCombinedService<TExtend = Record<string, never>>(
  service: Service<TExtend> | CombinedService<TExtend>
): service is CombinedService<TExtend> {
  return "children" in service && Array.isArray(service.children);
}

export class CombinedService<
  TExtend = Record<string, never>,
> extends Service<TExtend> {
  children: Service<TExtend>[];

  constructor({ children, ...options }: CombinedServiceOptions<TExtend>) {
    super(options);
    this.children = children;
  }
}

/**
 * Utility method for creating a single Veritas Service out of many independent services.
 * Useful when spinning up many microservices as a monolithic gateway bound to a single port.
 *
 * This method skips the regular bind phase of each service and instead creates an independent
 * Router for each service on which that services middleware and individual controllers are mounted
 * at the appropriate prefix.
 */
export function combineServices<TExtend = Record<string, never>>(
  services: Service<TExtend>[],
  config?: CombinedServiceConfiguration
): Service<TExtend> {
  const combinedConfig = {
    ...DEFAULT_COMBINED_SERVICE_CONFIGURATION,
    ...config,
  };
  const combinedService = new CombinedService<TExtend>({
    title: combinedConfig.title,
    description: combinedConfig.description,
    tags: combinedConfig.tags,
    children: services,
  });

  for (const service of services) {
    service.config = combinedConfig;
    service.init(combinedService.router);
    service.onError = combinedService.onError;
  }

  return combinedService;
}
